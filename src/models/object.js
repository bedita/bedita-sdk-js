import { BaseModel } from './base.js';

const SCHEMA = {
    definitions: {
        metadata: BaseModel.schema.definitions.metadata,
        object: {
            type: 'object',
            properties: {
                id: {
                    oneOf: [
                        { type: 'null' },
                        { type: 'string', maximum: 255 },
                    ],
                },
                type: {
                    type: 'string',
                    maximum: 255,
                },
                uname: {
                    oneOf: [
                        { type: 'null' },
                        { type: 'string', maximum: 255 },
                    ],
                },
                title: {
                    oneOf: [
                        { type: 'null' },
                        { type: 'string', maximum: 255 },
                    ],
                },
                status: {
                    options: ['on', 'draft', 'off'],
                },
                description: {
                    oneOf: [
                        { type: 'null' },
                        { type: 'string' },
                    ],
                },
                body: {
                    oneOf: [
                        { type: 'null' },
                        { type: 'string' },
                    ],
                },
                lang: {
                    oneOf: [
                        { type: 'null' },
                        { type: 'string', maximum: 255 },
                    ],
                },
                extra: {
                    oneOf: [
                        { type: 'null' },
                        { type: 'string', maximum: 255 },
                        { type: 'object' },
                        { type: 'array' },
                        { type: 'number' },
                    ],
                },
            },
        },
    },
    allOf: [
        { $ref: '#/definitions/object' },
        {
            type: 'object',
            properties: {
                metadata: {
                    $ref: '#/definitions/metadata',
                },
            },
        },
    ],
};

export class ObjectModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    static get type() {
        return 'objects';
    }
}
