import { BaseModel } from './base.js';

const SCHEMA = {
    definitions: BaseModel.schema.definitions,
    type: 'object',
    properties: {
        id: { type: 'string', maximum: 255 },
        api_key: { type: 'string', maximum: 255 },
        name: { type: 'string', maximum: 255 },
        description: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
        created: {
            oneOf: [
                { type: 'null' },
                { type: 'string', format: 'date-time' },
                { type: 'object', format: 'date-time' },
            ],
        },
        modified: {
            oneOf: [
                { type: 'null' },
                { type: 'string', format: 'date-time' },
                { type: 'object', format: 'date-time' },
            ],
        },
        enabled: { type: 'boolean' },
    },
};

export class ApplicationModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'applications';
    }
}
