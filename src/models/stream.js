import { BaseModel } from './base.js';
import { RELATIONSHIP_MODES } from '../collections/relationships.js';
import SCHEMA from '../schemas/objects/streams.json';

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
