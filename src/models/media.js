import { ObjectModel } from './object.js';
import { RELATIONSHIP_MODES } from '../collections/relationships.js';
import SCHEMA from '../schemas/objects/media.json';

export class MediaModel extends ObjectModel {
    static get schema() {
        return SCHEMA;
    }

    static get relationships() {
        return {
            streams: {
                types: ['streams'],
                mode: RELATIONSHIP_MODES.ONE_TO_ONE,
                inverse: 'object',
            },
        };
    }

    get type() {
        return 'media';
    }
}
