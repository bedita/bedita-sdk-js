import { BaseModel } from './base.js';

/**
 * @constant model schema
 * @type {Object}
 */
const SCHEMA = {
    definitions: BaseModel.schema.definitions,
    type: 'object',
    properties: {
        id: { type: 'string', maximum: 255 },
        type: { type: 'string', maximum: 255 },
        name: { type: 'string', maximum: 50 },
        singular: { type: 'string', maximum: 50 },
        is_abstract: { type: 'boolean' },
        description: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
        hidden: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
        parent_name: {
            oneOf: [
                { type: 'null' },
                { type: 'string', maximum: 50 },
            ],
        },
    },
};

/**
 * Object type model
 */
export class ObjectTypeModel extends BaseModel {

    /**
     * Return model schema
     * 
     * @return {Object} model schema
     */
    static get schema() {
        return SCHEMA;
    }

    /**
     * Return object model type
     * 
     * @return {String} object model type
     */
    get type() {
        return 'object_types';
    }

    /**
     * Temporarily empty, to avoid error on `save` ObjectTypeModel
     * Relation `properties` call `GET /object_types/:id/properties` instead of `/model/object_types/:id/properties`.
     * 
     * @return {Promise}
     */
    postRelationships() {
        return Promise.resolve();
    }

    /**
     * Retrieve the parent ObjectType.
     * @return {Promise<ObjectType>}
     */
    getParentModel() {
        if (this.parent_name) {
            return this.factory('model').getObjectType(this.parent_name);
        }
        return Promise.reject('missing `parent_name`');
    }

    /**
     * Retrieve a full list of properties.
     * @return {Promise<PropertiesCollection>}
     */
    getProperties() {
        return this.factory('model').getPropertiesForType(this.name);
    }

    /**
     * Retrieve static ObjectType properties.
     * @return {Promise<PropertiesCollection>}
     */
    getStaticProperties() {
        return this.factory('model').getStaticPropertiesForType(this.name);
    }

    /**
     * Retrieve dynamic ObjectType properties.
     * @return {Promise<PropertiesCollection>}
     */
    getDynamicProperties() {
        return this.factory('model').getDynamicPropertiesForType(this.name)
            .then((collection) => {
                this.on('change', () => {
                    // sync object type `name` with property' `object_type_name`
                    collection.forEach((model) => {
                        model.set('object_type_name', this.name, { validate: false });
                    });
                });
                return Promise.resolve(collection);
            });
    }

    /**
     * Create a property for object type.
     * @param {Object} data Property data.
     * @return {Promise<PropertyModel>}
     */
    createProperty(data = {}) {
        return this.factory('model').initModel('properties')
            .then((model) => {
                if (this.name) {
                    data.object_type_name = this.name;
                }
                model.set(data, { validate: false });
                this.on('change', () => {
                    // sync object type `name` with property' `object_type_name`
                    model.set('object_type_name', this.name, { validate: false });
                });
                return Promise.resolve(model);
            });
    }

    /**
     * Get all left relations.
     * @return {Promise<RelationsCollection>}
     */
    getLeftRelationships() {
        return this.factory('model').getLeftRelationsForType();
    }

    /**
     * Get all right relations.
     * @return {Promise<RelationsCollection>}
     */
    getRightRelationships() {
        return this.factory('model').getLeftRelationsForType();
    }
}
