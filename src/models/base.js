import { Model } from '../model.js';
import { RelationshipsCollection } from '../collections/relationships.js';

const REL_KEY = 'relationships';
const REL_META_KEY = 'relationshipsMeta';

export class BaseModel extends Model {
    initialize(...args) {
        let ctrRelationships = this.constructor.relationships || {};
        return super.initialize(...args)
            .then(() =>
                this.setupRelationships(ctrRelationships)
            );
    }

    merge(model) {
        return super.merge(model)
            .then(() => {
                let rels = model.getRelationships() || {};
                return this.setupRelationships(rels)
                    .then(() => {
                        Object.keys(rels).forEach((name) => {
                            let collection = this.getRelationship(name);
                            collection.reset();
                            let parentCollection = model.getRelationship(name);
                            parentCollection.forEach((relModel) => {
                                this.addRelationship(
                                    name,
                                    relModel,
                                    model.getRelationshipMeta(name, relModel)
                                );
                            });
                            collection.resetChanges();
                        });
                        return Promise.resolve(this);
                    });
            });
    }

    reset(skipChanges) {
        let rels = this.getRelationships() || {};
        Object.keys(rels).forEach((name) => {
            rels[name].reset(skipChanges);
        });
        this.set(REL_META_KEY, undefined, { internal: true });
        return super.reset(skipChanges);
    }

    setFromResponse(res) {
        if (res) {
            let relPromise = Promise.resolve();
            if (res.relationships) {
                relPromise = this.setupRelationships(res.relationships);
                delete res.relationships;
            }
            return relPromise.then(() =>
                super.setFromResponse(res)
                    .then((lastRes) =>
                        this.trigger('synced')
                            .then(() =>
                                Promise.resolve(lastRes)
                            )
                    )
            );
        }
        return super.setFromResponse(res);
    }

    getRelationships() {
        return this.get(REL_KEY, { internal: true });
    }

    setRelationships(data) {
        return this.set(REL_KEY, data, { internal: true, skipChanges: true });
    }

    fetchRelationships(options = {}) {
        let collections = this.getRelationships();
        let available = Object.keys(collections);
        let filterRelationships = options.relationships;
        if (filterRelationships === true) {
            filterRelationships = available;
        }
        let promise = Promise.resolve();
        available
            .filter((name) => {
                if (filterRelationships && filterRelationships.indexOf(name) === -1) {
                    return false;
                }
                return true;
            })
            .forEach((relName) => {
                promise = promise.then(() => this.fetchRelationship(relName, options));
            });
        return promise
            .then(() => {
                this.trigger('change', {});
                return Promise.resolve(this);
            });
    }

    postRelationships(options = {}) {
        let collections = this.getRelationships();
        return Promise.all(
            // update sub models
            Object.keys(collections).map((relName) => {
                let collection = collections[relName];
                let relationships = (collection || [])
                    .filter((model) =>
                        model.isNew() || model.hasChanges()
                    );
                return Promise.all(
                    relationships.map((model) => collection.post(model, options))
                );
            })
        ).then(() => {
            // update relationships
            let promise = Promise.resolve();
            Object.keys(collections).forEach((relName) => {
                promise = promise.then(() => collections[relName].update());
            });
            return promise;
        });
    }

    setupRelationships(rels = {}) {
        let collections = this.getRelationships() || {};
        return Promise.all(
            Object.keys(rels).map((name) => {
                let rel = rels[name];
                let relPromise = Promise.resolve(collections[name]);
                if (!collections.hasOwnProperty(name)) {
                    relPromise = this.initClass(RelationshipsCollection, name, this)
                        .then((collection) => {
                            collections[name] = collection;
                            return Promise.resolve(collection);
                        });
                }
                return relPromise.then((collection) => {
                    if (Array.isArray(rel.data)) {
                        collection.fetched = true;
                        return Promise.all(
                            rel.data.map((modelData) =>
                                collection.model(modelData, Model)
                                    .then((model) =>
                                        this.addRelationship(name, model)
                                    )
                            )
                        );
                    }
                    return Promise.resolve();
                });
            })
        ).then(() => {
            this.setRelationships(collections);
            return Promise.resolve();
        });
    }

    getRelationship(name) {
        let collections = this.getRelationships();
        if (collections) {
            return collections[name];
        }
        return undefined;
    }

    fetchRelationship(name, options) {
        let collection = this.getRelationship(name);
        if (collection && ((!options || Object.keys(options).length === 0) && collection.fetched || this.isNew())) {
            return Promise.resolve(collection);
        }
        if (!this.id) {
            return Promise.reject(new Error('Missing id'));
        }
        if (!collection) {
            return Promise.reject(new Error('Unavailable relationship'));
        }
        return collection.findAll(options).then(() => Promise.resolve(collection));
    }

    addRelationship(name, model, params) {
        let collection = this.getRelationship(name);
        if (collection.getIndexByModel(model) === -1) {
            collection.add(model);
        }
        if (params) {
            this.setRelationshipMeta(name, model, params, true);
        }
    }

    removeRelationship(name, model) {
        let collection = this.getRelationship(name);
        return collection.remove(model);
    }

    getRelationshipMeta(relName, model) {
        let relMeta = this.get(REL_META_KEY, { internal: true }) || {};
        return relMeta[relName] && relMeta[relName][model.id];
    }

    setRelationshipMeta(relName, model, meta, trigger) {
        let relMeta = this.get(REL_META_KEY, { internal: true }) || {};
        relMeta[relName] = relMeta[relName] || {};
        relMeta[relName][model.id] = meta;
        this.set(REL_META_KEY, relMeta, { internal: true });
        if (trigger) {
            this.trigger('relparams:change', {
                name: relName,
                left: this,
                right: model,
                meta,
            });
        }
    }

    hasRelationshipsChanges() {
        let collections = this.getRelationships();
        for (let k in collections) {
            if (collections[k].hasChanges()) {
                return true;
            }
        }
        return false;
    }

    setRelationshipParam(relName, model, paramName, paramValue) {
        let relMeta = this.getRelationshipMeta(relName, model) || {};
        relMeta.params = relMeta.params || {};
        if (relMeta.params[paramName] !== paramValue) {
            relMeta.params[paramName] = paramValue;
            relMeta.changed = true;
            this.setRelationshipMeta(relName, model, relMeta, true);
        }
    }
}
