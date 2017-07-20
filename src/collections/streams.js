import { Collection } from '../collection.js';
import { StreamModel } from '../models/stream.js';

export class StreamsCollection extends Collection {
    static get Model() {
        return StreamModel;
    }
}
