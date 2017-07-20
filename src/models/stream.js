import { BaseModel } from './base.js';

const SCHEMA = {
    definitions: BaseModel.schema.definitions,
    type: 'object',
    properties: {
        id: { type: 'string', maximum: 36 },
        file_name: { type: 'string' },
        mime_type: { type: 'string' },
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

    get type() {
        return 'streams';
    }
}
