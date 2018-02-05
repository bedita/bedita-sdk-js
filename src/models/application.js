import { BaseModel } from './base.js';

const SCHEMA = {
    definitions: BaseModel.schema.definitions,
    type: 'object',
    properties: {
        id: { type: 'string', maximum: 255 },
        name: { type: 'string', maximum: 255 },
        api_key: { type: 'string', maximum: 255, readOnly: true },
        description: {
            oneOf: [
                { type: 'null' },
                { type: 'string', contentMediaType: 'text/html' },
            ],
        },
        created: {
            oneOf: [
                { type: 'null' },
                { type: 'string', format: 'date-time' },
                { type: 'object', format: 'date-time' },
            ],
            readOnly: true,
        },
        modified: {
            oneOf: [
                { type: 'null' },
                { type: 'string', format: 'date-time' },
                { type: 'object', format: 'date-time' },
            ],
            readOnly: true,
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
