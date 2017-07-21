import { BaseModel } from './base.js';
import { RELATIONSHIP_MODES } from '../collections/relationships.js';

const SCHEMA = {
    definitions: BaseModel.schema.definitions,
    type: 'object',
    properties: {
        id: { type: 'string', maximum: 36 },
        type: { type: 'string', maximum: 255 },
        file_name: { type: 'string', maximum: 255 },
        mime_type: { type: 'string', maximum: 255 },
        metadata: {
            allOf: [
                { $ref: '#/definitions/metadata' },
                {
                    type: 'object',
                    properties: {
                        version: { type: 'number' },
                        file_size: { type: 'number' },
                        hash_md5: { type: 'string' },
                        hash_sha1: { type: 'string' },
                        url: {
                            oneOf: [
                                { type: 'null' },
                                { type: 'string' },
                            ],
                        },
                    },
                },
            ],
        },
    },
};

export class StreamModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    static get relationships() {
        return {
            object: {
                types: ['media'],
                mode: RELATIONSHIP_MODES.ONE_TO_ONE,
            },
        };
    }

    get type() {
        return 'streams';
    }
}
