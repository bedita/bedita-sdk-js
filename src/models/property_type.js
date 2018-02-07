import { BaseModel } from './base.js';

const SCHEMA = {
    definitions: BaseModel.schema.definitions,
    type: 'object',
    properties: {
        id: { type: 'string', maximum: 255 },
        type: { type: 'string', maximum: 255 },
        name: { type: 'string', maximum: 255 },
        params: {
            oneOf: [
                { type: 'null' },
                { type: 'object' },
            ],
        },
    },
};

export class PropertyTypeModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'property_types';
    }
}
