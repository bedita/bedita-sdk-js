import { Model } from '../model.js';
import { RelationshipsCollection } from '../collections/relationships.js';

const REL_KEY = 'relationships';
const REL_META_KEY = 'relationshipsMeta';

export class BaseModel extends Model {
    /**
     * @inheritdoc
     */
    static create(type, schema, relations) {
        // handle relations
        const Ctr = super.create(type, schema);
        if (relations) {
            Ctr.relationships = relations;
        }
        return Ctr;
    }

    /**
     * @inheritdoc
     */
    initialize(...args) {
        let ctrRelationships = this.constructor.relationships || {};
        return super.initialize(...args)
            .then(() =>
                // setup object relationships collections.
                this.setupRelationships(ctrRelationships)
            );
    }

    /**
     * @inheritdoc
     */
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

    /**
     * @inheritdoc
     */
    reset(skipChanges) {
        // reset relationships collections
        let rels = this.getRelationships() || {};
        Object.keys(rels).forEach((name) => {
            rels[name].reset(skipChanges);
        });
        // reset relationships metadata
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

    /**
     * Add a relationship.
     * @memberof BaseModel
     *
     * @param {string} relName The name of the relationship to add.
     * @param {Model} relModel The related model to add.
     * @param {Object} [params] A set of relationship params.
     * @return {void}
     */
    addRelationship(relName, relModel, params) {
        let collection = this.getRelationship(relName);
        if (collection.getIndexByModel(relModel) === -1) {
            collection.add(relModel);
        }
        if (params) {
            this.setRelationshipMeta(relName, relModel, params, true);
        }
    }

    /**
     * Remove a relationship.
     * @memberof BaseModel
     *
     * @param {string} relName The name of the relationship to remove.
     * @param {Model} relModel The related model to remove.
     * @return {void}
     */
    removeRelationship(relName, relModel) {
        let collection = this.getRelationship(relName);
        collection.remove(relModel);
    }

    /**
     * Get relationship metadata.
     * @memberof BaseModel
     *
     * @param {string} relName The name of the relationship.
     * @param {Model} relModel The related model.
     * @return {Object|void} A set of relationship metadata.
     */
    getRelationshipMeta(relName, relModel) {
        let relMeta = this.get(REL_META_KEY, { internal: true }) || {};
        return relMeta[relName] && relMeta[relName][relModel.id];
    }

    /**
     * Update relationship's metadata and parameters.
     * @memberof BaseModel
     *
     * @param {string} relName The name of the relationship to update.
     * @param {Model} relModel The related model.
     * @param {Object} meta The new meta object to set.
     * @param {Boolean} trigger Should trigger a change event.
     * @return {void}
     *
     * @emits BaseModel#relparams:change A relationship param has changed.
     */
    setRelationshipMeta(relName, relModel, meta, trigger) {
        // get all relationships metadata
        const relMeta = this.get(REL_META_KEY, { internal: true }) || {};
        // get relationship metadata
        relMeta[relName] = relMeta[relName] || {};
        // set metadata for the related model
        relMeta[relName][relModel.id] = meta;
        // update relationships metadata
        this.set(REL_META_KEY, relMeta, { internal: true });
        if (trigger) {
            // trigger the change event
            this.trigger('relparams:change', {
                name: relName,
                left: this,
                right: relModel,
                meta,
            });
        }
    }

    /**
     * Check if relationships are changed from the latest remote sync.
     * @memberof BaseModel
     *
     * @return {Boolean}
     */
    hasRelationshipsChanges() {
        let collections = this.getRelationships();
        // iterate every relationship
        for (let k in collections) {
            // and check if it has changes
            if (collections[k].hasChanges()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Add a parameter to a model relationship.
     * @memberof BaseModel
     *
     * @param {string} relName The name of the relation to update.
     * @param {Model} relModel The related model.
     * @param {string} paramName The name of the paramater to update.
     * @param {*} paramValue The value to set.
     * @return {void}
     */
    setRelationshipParam(relName, relModel, paramName, paramValue) {
        // get all the parameters of the relationship.
        let relMeta = this.getRelationshipMeta(relName, relModel) || {};
        // setup the `params` field
        if (!relMeta.params) {
            relMeta.params = {};
        }
        // check if the paramater has to be updated
        if (relMeta.params[paramName] !== paramValue) {
            relMeta.params[paramName] = paramValue;
            // flag the relationship metatdata has changed
            relMeta.changed = true;
            // update the model
            this.setRelationshipMeta(relName, relModel, relMeta, true);
        }
    }
}
