import { Collection } from '../collection.js';
import { MediaModel } from '../models/media.js';

/**
 * @class bedita.MediaCollection
 * @extends bedita.Collection
 * A collection for MediaModels.
 */
export class MediaCollection extends Collection {
    /**
     * @inheritdoc
     */
    static get Model() {
        return MediaModel;
    }
}
