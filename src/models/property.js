import { BaseModel } from './base.js';

const SCHEMA = {
    type: 'object',
    properties: {
        id: { type: 'string', maximum: 255 },
        type: { type: 'string', maximum: 255 },
        name: { type: 'string', maximum: 255 },
        property_type_name: { type: 'string', maximum: 255 },
        object_type_name: { type: 'string', maximum: 255 },
        description: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
    },
    required: ['name', 'property_type_name', 'object_type_name'],
};

export class PropertyModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'properties';
    }
}
