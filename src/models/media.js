import { ObjectModel } from './object.js';
import './role.js';

const SCHEMA = {
    type: 'object',
    definitions: ObjectModel.schema.definitions,
    allOf: [
        { $ref: '#/definitions/object' },
        {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                },
                width: {
                    type: 'number',
                },
                height: {
                    type: 'number',
                },
                duration: {
                    oneOf: [
                        { type: 'null' },
                        { type: 'number' },
                    ],
                },
                metadata: { $ref: '#/definitions/metadata' },
            },
        },
    ],
};

export class MediaModel extends ObjectModel {
    static get schema() {
        return SCHEMA;
    }

    static get relationships() {
        return {
            streams: {
                types: ['streams'],
            },
        };
    }

    get type() {
        return 'media';
    }
}
