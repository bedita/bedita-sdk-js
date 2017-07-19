import { Collection } from '../collection.js';
import { ObjectModel } from '../models/object.js';

export class ObjectsCollection extends Collection {
    static get Model() {
        return ObjectModel;
    }
}
