import { ObjectModel } from './object.js';
import { RELATIONSHIP_MODES } from '../collections/relationships.js';
import SCHEMA from '../schemas/objects/media.json';

export class MediaModel extends ObjectModel {
    static get schema() {
        return SCHEMA;
    }

    static get relations() {
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

    /**
     * @inheritdoc
     */
    initialize(...args) {
        return super.initialize(...args)
            .then(() => this.setupRelationship('streams'));
    }

    /**
     * @inheritdoc
     */
    setFromResponse(response, included = []) {
        return super.setFromResponse(response, included)
            .then((result) =>
                this.fetchRelationship('streams').then(() => result)
            );
    }
}
