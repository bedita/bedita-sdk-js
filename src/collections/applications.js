import { Collection } from '../collection.js';
import { ApplicationModel } from '../models/application.js';

export class ApplicationsCollection extends Collection {
    static get Model() {
        return ApplicationModel;
    }

    getMinimalPropertiesSet() {
        return Promise.resolve(['id', 'api_key', 'name', 'description']);
    }

    /**
     * The endpoint for Applications.
     * @type {String}
     */
    get defaultEndpoint() {
        return '/admin/applications';
    }
}
