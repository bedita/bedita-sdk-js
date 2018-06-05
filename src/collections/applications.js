import { Collection } from '../collection.js';
import { ApplicationModel } from '../models/application.js';

/**
 * @class bedita.ApplicationsCollection
 * @extends bedita.Collection
 * A collection for ApplicationModels.
 */
export class ApplicationsCollection extends Collection {
    /**
     * @inheritdoc
     */
    static get Model() {
        return ApplicationModel;
    }

    /**
     * @inheritdoc
     */
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
