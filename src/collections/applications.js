import { Collection } from '../collection.js';
import { ApplicationModel } from '../models/application.js';

export class ApplicationsCollection extends Collection {
    static get Model() {
        return ApplicationModel;
    }

    getMinimalPropertiesSet() {
        return ['id', 'metadata.api_key', 'name', 'description'];
    }
}
