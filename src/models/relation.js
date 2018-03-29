import { BaseModel } from './base.js';
import { RELATIONSHIP_MODES } from '../collections/relationships.js';

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
        inverse_name: { type: 'string', maximum: 50 },
        label: { type: 'string', maximum: 50 },
        inverse_label: { type: 'string', maximum: 50 },
        description: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
        params: {
            type: 'object',
        },
    },
};

/**
 * Relation model
 */
export class RelationModel extends BaseModel {
    /**
     * Return model schema
     * 
     * @return {Object} model schema
     */
    static get schema() {
        return SCHEMA;
    }

    /**
     * Return the relationships schema
     *
     * @return {Object} A list of relations description
     */
    static get relationships() {
        return {
            left_object_types: {
                types: ['object_type'],
                mode: RELATIONSHIP_MODES.ONE_TO_MANY,
            },
            right_object_types: {
                types: ['object_type'],
                mode: RELATIONSHIP_MODES.ONE_TO_MANY,
            },
        };
    }

    /**
     * Return relation model type
     * 
     * @return {String} relation model type
     */
    get type() {
        return 'relation';
    }
}
