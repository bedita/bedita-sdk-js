import clone from '@chialab/proteins/src/clone.js';
import { Collection } from '../collection.js';

export const RELATIONSHIP_MODES = {
    ONE_TO_MANY: 0,
    ONE_TO_ONE: 1,
};

export class RelationshipsCollection extends Collection {
    get def() {
        let parent = this.parent;
        let rels = parent.constructor.relationships || {};
        return rels.hasOwnProperty(this.name) ? rels[this.name] : {};
    }

    get inverse() {
        return this.def.inverse;
    }

    get type() {
        return this.def.types || [];
    }

    get mode() {
        return this.def.mode || RELATIONSHIP_MODES.ONE_TO_MANY;
    }

    initialize(name, left) {
        this.name = name;
        this.parent = left;
        this.fetched = false;
        this.resetChanges();
        return super.initialize()
            .then(() => {
                this.parent.on('relparams:change', (changed) => {
                    if (changed.name === this.name) {
                        this.updateRelationshipsChanges(changed.right, 'changed');
                        this.trigger('change', { type: 'update' });
                    }
                });
                this.on('change', (changes) => {
                    if (changes.type === 'add') {
                        left.trigger('relationship:added');
                        left.trigger('relationship:change');
                        changes.added.forEach((model) => {
                            this.updateRelationshipsChanges(model, 'add');
                        });
                    } else if (changes.type === 'remove') {
                        left.trigger('relationship:removed');
                        left.trigger('relationship:change');
                        changes.removed.forEach((model) => {
                            this.updateRelationshipsChanges(model, 'remove');
                        });
                    } else if (changes.type === 'update') {
                        left.trigger('relationship:updated');
                        left.trigger('relationship:change');
                    }
                });
                return Promise.resolve();
            });
    }

    add(...models) {
        super.add(...models);
        models.forEach((model) => {
            this.parent.addRelationship(this.name, model);
        });
    }

    getMinimalPropertiesSet() {
        if (this.type && this.type.length === 1) {
            return this.factory('model').getCollection(this.type[0])
                .then((Ctr) =>
                    Ctr.prototype.getMinimalPropertiesSet.call(this)
                );
        }
        return super.getMinimalPropertiesSet();
    }

    fetchRelationableTypes() {
        let types = this.type;
        if (types) {
            return Promise.resolve(types);
        }
        return this.factory('model').getObjectTypes()
            .then((collection) =>
                collection.findAllByRelationship(this.name)
                    .then(() =>
                        Promise.resolve(
                            collection.map((type) => type.name)
                        )
                    )
            );
    }

    fetchRelationableObjects() {
        return this.fetchRelationableTypes()
            .then((types) => {
                let resolveCollection;
                if (types.length === 1) {
                    types = types[0];
                    resolveCollection = this.factory('model').getCollection(types)
                        .catch(() => Collection);
                } else {
                    resolveCollection = Promise.resolve(Collection);
                }
                return resolveCollection
                    .then((Ctr) => this.initClass(Ctr))
                    .then((collection) => {
                        let endpoint = Array.isArray(types) ?
                            `/objects?${types.map((type) => `filter[type][]=${type}`).join('&')}` :
                            `/${types}`;
                        return collection.findAll({ endpoint })
                            .then(() => Promise.resolve(collection));
                    });
            });
    }

    updateRelationshipsChanges(model, method) {
        const Model = this.constructor.Model;
        const changes = this.changes;
        if (method === 'changed') {
            const changed = changes.changed;
            if (changed.indexOf(model) === -1) {
                changed.push(model);
            }
        } else {
            const removed = method === 'add' ? changes.removed : changes.added;
            const added = method === 'add' ? changes.added : changes.removed;
            for (let i = 0, len = removed.length; i < len; i++) {
                let entry = removed[i];
                entry = (entry instanceof Model) ? entry : { id: entry };
                if ((model.id && model.id === entry.id) || (!model.id && model === entry)) {
                    removed.splice(i, 1);
                    break;
                }
            }
            for (let i = 0, len = added.length; i < len; i++) {
                let entry = added[i];
                entry = (entry instanceof Model) ? entry : { id: entry };
                if ((model.id && model.id === entry.id) || (!model.id && model === entry)) {
                    return;
                }
            }
            added.push(model);
        }
    }

    findAll(options = {}) {
        options = clone(options);
        if (!options.endpoint) {
            options.endpoint = `${this.parent.type}/${this.parent.id}/${this.name}`;
        }
        return super.findAll(options)
            .then((res) => {
                this.fetched = true;
                let paramsList = this.paramsList || [];
                this.forEach((model, index) => {
                    if (paramsList[index]) {
                        this.parent.setRelationshipMeta(this.name, model, paramsList[index], false);
                    }
                });
                this.resetChanges();
                return Promise.resolve(res);
            });
    }

    afterFetch(res) {
        if (this.mode === RELATIONSHIP_MODES.ONE_TO_ONE && !this.inverse) {
            if (res && res.data) {
                res.data = [res.data];
            }
        }
        this.paramsList = (res && res.data || []).map((d) => {
            if (d.meta && d.meta.relation) {
                let p = {
                    params: d.meta.relation.params || {},
                    priority: d.meta.relation.priority,
                    inv_priority: d.meta.relation.inv_priority,
                };
                delete d.meta.relation;
                return p;
            }
        });
        return super.afterFetch(res);
    }

    hasChanges() {
        let changes = this.changes;
        return changes.added.length || changes.removed.length || changes.changed.length;
    }

    resetChanges() {
        this.changes = {
            added: [],
            removed: [],
            changed: [],
        };
    }

    update() {
        let ids = [];
        let changes = this.changes;
        let promise = Promise.resolve();
        let api = this.parent.type;
        let relationship = this.name;
        let subject = this.parent.id;
        if (this.inverse && this.mode === RELATIONSHIP_MODES.ONE_TO_ONE) {
            api = this.type[0];
            relationship = this.inverse;
        }
        if (changes.removed.length) {
            if (this.mode === RELATIONSHIP_MODES.ONE_TO_ONE) {
                let model = changes.removed[0];
                subject = model.id;
                promise = promise.then(() =>
                    this.execPost({
                        endpoint: `/${api}/${subject}/relationships/${relationship}`,
                        body: null,
                        method: 'PATCH',
                    })
                );
            } else {
                promise = promise.then(() =>
                    this.execPost({
                        endpoint: `/${api}/${subject}/relationships/${relationship}`,
                        body: {
                            data: changes.removed.map((model) => {
                                ids.push(model.id);
                                return {
                                    id: model.id,
                                    type: model.type,
                                };
                            }),
                        },
                        method: 'DELETE',
                    })
                );
            }
        }
        if (changes.added.length) {
            if (this.mode === RELATIONSHIP_MODES.ONE_TO_ONE) {
                let model = changes.added[0];
                subject = model.id;
                promise = promise.then(() =>
                    this.execPost({
                        endpoint: `/${api}/${subject}/relationships/${relationship}`,
                        body: {
                            data: {
                                id: this.parent.id,
                                type: this.parent.type,
                                meta: {
                                    relation: this.parent.getRelationshipMeta(this.name, model),
                                },
                            },
                        },
                        method: 'PATCH',
                    })
                );
            } else {
                promise = promise.then(() =>
                    this.execPost({
                        endpoint: `/${api}/${subject}/relationships/${relationship}`,
                        body: {
                            data: changes.added.map((model) => {
                                ids.push(model.id);
                                return {
                                    id: model.id,
                                    type: model.type,
                                    meta: {
                                        relation: this.parent.getRelationshipMeta(this.name, model),
                                    },
                                };
                            }),
                        },
                    })
                );
            }
        }
        if (changes.changed.length) {
            if (this.mode === RELATIONSHIP_MODES.ONE_TO_ONE) {
                let model = changes.changed[0];
                subject = model.id;
                promise = promise.then(() =>
                    this.execPost({
                        endpoint: `/${api}/${subject}/relationships/${relationship}`,
                        body: {
                            data: {
                                id: this.parent.id,
                                type: this.parent.type,
                                meta: {
                                    relation: this.parent.getRelationshipMeta(this.name, model),
                                },
                            },
                        },
                        method: 'PATCH',
                    })
                );
            } else {
                promise = promise.then(() =>
                    this.execPost({
                        endpoint: `/${api}/${subject}/relationships/${relationship}`,
                        body: {
                            data: changes.changed.map((model) => ({
                                id: model.id,
                                type: model.type,
                                meta: {
                                    relation: this.parent.getRelationshipMeta(this.name, model),
                                },
                            })),
                        },
                    })
                );
            }
        }
        return promise.then(() => {
            this.resetChanges();
            return this.findAll();
        });
    }

    /** @inheritdoc */
    joinCollection(collection) {
        let joinPromise = Promise.resolve();
        if (this.parent !== collection.parent) {
            joinPromise = super.joinCollection(collection);
        }

        return joinPromise
            .then(() => {
                this.paramsList = this.paramsList || [];
                this.paramsList.push(...(collection.paramsList || []));
                return Promise.resolve();
            });
    }

    /** @inheritdoc */
    getCleanCopy() {
        return this.initClass(this.constructor, this.name, this.parent);
    }
}
