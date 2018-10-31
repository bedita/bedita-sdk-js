import { clone } from '@chialab/proteins';
import { AjaxModel } from '@chialab/synapse/src/models/ajax.js';
import { internal } from '@chialab/synapse/src/helpers/internal';
import tv4 from 'tv4';

tv4.addFormat('date-time', (data) => {
    if (typeof data === 'string') {
        data = new Date(data);
    }
    if ((data instanceof Date) && !isNaN(data.getTime())) {
        return null;
    }
    return 'Invalid date';
});

const REL_KEY = 'relationships';
const REL_META_KEY = 'relationshipsMeta';

export class Model extends AjaxModel {
    static get schema() {
        return {};
    }

    static create(type, schema, relations) {
        const Ctr = this;
        schema = {
            allOf: [Ctr.schema, schema],
        };
        return class extends Ctr {
            static get schema() { return schema; }
            static get relations() { return relations; }
            get type() { return type; }
        };
    }

    /**
     * @inheritdoc
     */
    initialize(...args) {
        return super.initialize(...args)
            .then(() =>
                // setup object relationships collections.
                this.setupRelationships()
            );
    }

    isNew() {
        return !this.id;
    }

    isDeleted() {
        return !!this.$deleted;
    }

    delete() {
        this.reset(true);
        this.tickDeleted();
        this.trigger('deleted');
    }

    setChanges(...args) {
        super.setChanges(...args);
        this.tickModified();
    }

    resetChanges() {
        super.resetChanges();
        this.tickModified(this.modified || 0);
    }

    hasLocalChanges() {
        let remote = new Date(this.modified || 0);
        let current = new Date(this.get('$modified'));
        return current > remote;
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

    clone() {
        return this.initClass(this.constructor)
            .then((clone) => clone.merge(this))
            .then((clone) => {
                clone.resetChanges();
                return Promise.resolve(clone);
            });
    }

    merge(model) {
        this.set(model.toJSON(true));
        let relationships = model.getRelationships() || {};
        Object.keys(relationships).forEach((relationName) => {
            let collection = this.getRelationship(relationName);
            let parentCollection = model.getRelationship(relationName);
            collection.reset();
            parentCollection.forEach((relatedModel) => {
                this.addRelationship(
                    relationName,
                    relatedModel,
                    model.getRelationshipMeta(relationName, relatedModel)
                );
            });
            collection.resetChanges();
        });
        return this;
    }

    get metadata() {
        return internal(this).metadata || {};
    }

    setFromResponse(response, included = []) {
        if (!response) {
            return super.setFromResponse(response);
        }
        response = clone(response);
        if (response.id) {
            this.set({
                id: response.id,
            }, {
                validate: false,
                skipChanges: true,
            });
            delete response.id;
        }
        if (response.type) {
            this.set({
                type: response.type,
            }, {
                validate: false,
                skipChanges: true,
            });
            delete response.type;
        }
        if (response.attributes) {
            this.set(response.attributes, {
                validate: false,
                skipChanges: true,
            });
            delete response.attributes;
        }
        let setRelationsPromise = Promise.resolve();
        if (response.relationships) {
            setRelationsPromise = this.setIncludedFromResponse(response.relationships, included)
                .then(() => {
                    delete response.relationships;
                });
        }
        if (response.meta) {
            internal(this).metadata = response.meta;
            const schemaProperties = this.constructor.schemaProperties;
            for (let metaName in response.meta) {
                if (schemaProperties.hasOwnProperty(metaName) && schemaProperties[metaName].readOnly) {
                    this.set(metaName, response.meta[metaName], {
                        validate: false,
                        skipChanges: true,
                    });
                }
            }
            this.tickModified(this.modified || 0);
            delete response.meta;
        }
        delete response.links;
        return setRelationsPromise
            .then(() => super.setFromResponse(response))
            .then((model) =>
                this.trigger('synced').then(() => model)
            );
    }

    setIncludedFromResponse(relationships, included = []) {
        const modelFactory = this.factory('model');
        return Promise.all(
            Object.keys(relationships)
                .map((relationName) =>
                    this.setupRelationship(relationName)
                        .then((collection) => {
                            let relation = relationships[relationName];

                            if (!relation.data) {
                                return collection;
                            }
                            let setRelationDataPromise = Promise.resolve();
                            relation.data.forEach((relation) => {
                                let relatedData = included.find((includedData) => includedData.id === relation.id && includedData.type === relation.type);
                                if (!relatedData) {
                                    return;
                                }
                                setRelationDataPromise = setRelationDataPromise
                                    .then(() => modelFactory.initModel(relatedData.type))
                                    .then((relatedModel) =>
                                        relatedModel.setFromResponse(relatedData, included)
                                            .then(() => {
                                                collection.add(relatedModel);
                                            })
                                    );
                            });
                            return setRelationDataPromise;
                        })
                )
        );
    }

    tickModified(date = Date.now()) {
        this.set('$modified', new Date(date).getTime(), { skipChanges: true, validate: false });
    }

    tickDeleted() {
        this.set('$deleted', true, { skipChanges: false, validate: false });
    }

    toJSONApi(stripUndefined, onlyChanges) {
        let res = {};
        let data = this.toJSON(stripUndefined);
        if (this.id) {
            res.id = this.id;
        }
        if (this.type) {
            res.type = this.type;
        }
        if (onlyChanges) {
            let changed = this.changed();
            for (let k in data) {
                if (changed.indexOf(k) === -1) {
                    delete data[k];
                }
            }
        }
        res.attributes = data;
        return res;
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
        let filterRelations = options.relations;
        if (filterRelations === true) {
            filterRelations = available;
        }
        let promise = Promise.resolve();
        available
            .filter((name) => {
                if (filterRelations && filterRelations.indexOf(name) === -1) {
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

    setupRelationship(relationName) {
        const modelFactory = this.factory('model');
        const collections = this.getRelationships() || {};

        if (collections.hasOwnProperty(relationName)) {
            return Promise.resolve(collections[relationName]);
        }

        return modelFactory.initRelationshipsCollection(this, relationName)
            .then((collection) => {
                collections[relationName] = collection;
                this.setRelationships(collections);
                return collection;
            });
    }

    setupRelationships() {
        const relations = this.constructor.relations || {};

        return Promise.all(
            Object.keys(relations).map((relationName) => {
                let rel = relations[relationName];
                return this.setupRelationship(relationName)
                    .then((collection) => {
                        if (Array.isArray(rel.data)) {
                            collection.fetched = true;
                            return Promise.all(
                                rel.data.map((modelData) =>
                                    collection.model(modelData)
                                        .then((model) =>
                                            this.addRelationship(relationName, model)
                                        )
                                )
                            );
                        }
                        return Promise.resolve();
                    });
            })
        );
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

    /**
     * Validate local data for the model.
     * @param {Object} data The data to validate.
     * @param {Object} options A set of options for the validation.
     * @return {boolean}
     */
    validate(data, options) {
        if (this.factory('model').autoValidation) {
            return {
                valid: true,
            };
        }
        return super.validate(data, options);
    }
}
