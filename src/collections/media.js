import { Collection } from '../collection.js';
import { MediaModel } from '../models/media.js';

export class MediaCollection extends Collection {
    static get Model() {
        return MediaModel;
    }
}
