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
        parent_id: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
        tree_left: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
        tree_right: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
        is_abstract: {
            oneOf: [
                { type: 'boolean' },
            ],
        },
        singular: { type: 'string', maximum: 50 },
        name: { type: 'string', maximum: 50 },
        description: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
        plugin: { type: 'string', maximum: 255 },
        model: {
            oneOf: [
                { type: 'null' },
                { type: 'string', maximum: 50 },
            ],
        },
        association: {
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
        table: {
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
}
