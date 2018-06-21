import { Factory } from '@chialab/synapse/src/factory.js';
import { Collection } from '../collection.js';
import { ObjectTypesCollection } from '../collections/object_types.js';
import { PropertyTypesCollection } from '../collections/property_types.js';
import { PropertiesCollection } from '../collections/properties.js';

/**
 * Handle models via API.
 *
 * @class ModelFactory
 * @extends Factory
 */
export class ModelFactory extends Factory {
    /**
     * Get the JSON schema for a model type.
     * @param {String} type The model type.
     * @return {Promise<Object>} The model schema.
     */
    getSchema(type) {
        return this.factory('api').get(`/model/schema/${type}`);
    }

    /**
     * Create a singleton registry of models and collections.
     * @param {Object} options A set of options for the factory.
     * @param {Array<Collection>} options.collections A set of Collections to pre-register.
     * @param {Array<Model>} options.models A set of Models to pre-register.
     * @return {Promise}
     */
    initialize(options = {}) {
        this.models = {};
        this.collections = {};
        this.modelQueue = {};
        this.collectionQueue = {};
        return super.initialize(options)
            .then(() => {
                (options.models || []).forEach((Model) => {
                    this.registerModel(Model);
                });
                (options.collections || []).forEach((Collection) => {
                    this.registerCollection(Collection);
                });
                return Promise.resolve(this);
            });
    }

    /**
     * Add a Model to the registry.
     * @param {Class<Model>} Model A Model constructor.
     */
    registerModel(Model) {
        this.models[Model.prototype.type || Model.type] = Model;
    }

    /**
     * Get a Model constructor by type.
     * @param {String} type The type of the Model to retrieve.
     * @return {Promise<Class<Model>>} The Model constructor.
     */
    getModel(type) {
        if (this.hasModel(type)) {
            return Promise.resolve(this.models[type]);
        }
        if (this.modelQueue[type]) {
            return this.modelQueue[type];
        }
        this.modelQueue[type] = this.getObjectType(type)
            .then((objectType) => {
                let parentId = objectType.parent_name || 'objects';
                return this.getModel(parentId)
                    .then((ParentModel) =>
                        this.getSchema(type)
                            .then((data) => {
                                let relations = {};
                                if (objectType.metadata().relations) {
                                    objectType.metadata().relations.forEach((rel) => {
                                        relations[rel] = {};
                                    });
                                }
                                let TypedModel = ParentModel.create(type, data, relations);
                                this.registerModel(TypedModel);
                                return TypedModel;
                            })
                    );
            });
        return this.modelQueue[type];
    }

    /**
     * Check if a Model is in registry.
     * @param {String} type The type of the Model.
     * @return {Boolean}
     */
    hasModel(type) {
        return this.models.hasOwnProperty(type);
    }

    /**
     * Add a Collection to the registry.
     * @param {Class<Collection>} Collection A Collection constructor.
     */
    registerCollection(Collection) {
        this.collections[Collection.prototype.type || Collection.type] = Collection;
    }

    /**
     * Get a Collection constructor by type.
     * @param {String} type The type of the Collection to retrieve.
     * @return {Promise<Class<Collection>>} The Collection constructor.
     */
    getCollection(type) {
        if (this.hasCollection(type)) {
            return Promise.resolve(this.collections[type]);
        }
        if (this.collectionQueue[type]) {
            return this.collectionQueue[type];
        }
        this.collectionQueue[type] = this.getModel(type)
            .then((Model) => {
                let TypedCollection = Collection.create(Model);
                this.registerCollection(TypedCollection);
                return Promise.resolve(TypedCollection);
            });
        return this.collectionQueue[type];
    }

    /**
     * Check if a Collection is in registry.
     * @param {String} type The type of the Collection.
     * @return {Boolean}
     */
    hasCollection(type) {
        return this.collections.hasOwnProperty(type);
    }

    /**
     * Instantiate a new Collection by type.
     * @param {String} type The collection type.
     * @param {Object} arr The initial array of models.
     * @return {Promise<Collection>}
     */
    initCollection(type, arr) {
        let resolveCollectionCtr;
        if (typeof type === 'string') {
            // get or generate the collection
            resolveCollectionCtr = this.getCollection(type);
        } else if (typeof type === 'function') {
            // already a Class contrusctor
            resolveCollectionCtr = Promise.resolve(type);
        }
        return resolveCollectionCtr.then((Collection) => this.initClass(Collection, arr));
    }

    /**
     * Instantiate a new Model by type.
     * @param {String} type The model type.
     * @param {Object} data A set of initial data.
     * @return {Promise<Model>}
     */
    initModel(type, data) {
        let resolveModelCtr;
        if (typeof type === 'string') {
            // get or generate the model
            resolveModelCtr = this.getModel(type);
        } else if (typeof type === 'function') {
            // already a Class contrusctor
            resolveModelCtr = Promise.resolve(type);
        }
        return resolveModelCtr.then((Model) => this.initClass(Model, data));
    }

    /**
     * Fetch all object types.
     * @return {Promise<ObjectTypesCollection>}
     */
    getObjectTypes() {
        return this.initClass(ObjectTypesCollection)
            .then((collection) =>
                collection.findAll()
                    .then(() => collection)
            );
    }

    /**
     * Fetch abstract object types.
     * @return {Promise<ObjectTypesCollection>}
     */
    getAbstractObjectTypes() {
        return this.initClass(ObjectTypesCollection)
            .then((collection) =>
                collection.findAll({
                    filter: {
                        is_abstract: true,
                    },
                }).then(() => collection)
            );
    }

    /**
     * Get the ObjectType Model for a given type.
     * @param {String} type The type of the Model.
     * @return {Promise<ObjectType>}
     */
    getObjectType(type) {
        return this.initClass(ObjectTypesCollection)
            .then((collection) => collection.findById(type));
    }

    /**
     * Fetch all property types.
     * @return {Promise<PropertyTypesCollection>}
     */
    getPropertyTypes() {
        return this.initClass(PropertyTypesCollection)
            .then((collection) =>
                collection.findAll()
                    .then(() => collection)
            );
    }

    /**
     * Fetch a full list of properties for object type.
     * @param {String} type The object type name.
     * @return {Promise<PropertiesCollection>}
     */
    getPropertiesForType(type) {
        return this.initClass(PropertiesCollection)
            .then((collection) =>
                collection.findAllByObjectType(type)
                    .then(() => collection)
            );
    }

    /**
     * Fetch a list of static properties for object type.
     * @param {String} type The object type name.
     * @return {Promise<PropertiesCollection>}
     */
    getStaticPropertiesForType(type) {
        return this.initClass(PropertiesCollection)
            .then((collection) => {
                if (type) {
                    return collection.findAllByObjectType(type, 'static')
                        .then(() => collection);
                }
                return collection;
            });
    }

    /**
     * Fetch a list of dynamic properties for object type.
     * @param {String} type The object type name.
     * @return {Promise<PropertiesCollection>}
     */
    getDynamicPropertiesForType(type) {
        return this.initClass(PropertiesCollection)
            .then((collection) => {
                if (type) {
                    return collection.findAllByObjectType(type, 'dynamic')
                        .then(() => collection);
                }
                return collection;
            });
    }
}
