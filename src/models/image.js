import { MediaModel } from './media.js';

export class ImageModel extends MediaModel {
    get type() {
        return 'images';
    }
}
