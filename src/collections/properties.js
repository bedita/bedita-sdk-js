import { Collection } from '../collection.js';
import { PropertyModel } from '../models/property.js';

export class PropertiesCollection extends Collection {
    static get Model() {
        return PropertyModel;
    }

    getMinimalPropertiesSet() {
        return Promise.resolve(['name', 'description', 'property_type_name', 'object_type_name']);
    }

    get defaultEndpoint() {
        return '/model/properties';
    }

    /**
     * Get a list of properties by model type
     * @param {String} type The object type.
     * @param {String} filter Should filter `static` or `dynamic` properties.
     * @return {Promise}
     */
    findAllByObjectType(type, filter = false) {
        let options = {
            filter: {
                object_type: type,
            },
        };
        if (filter) {
            options.filter.type = filter;
        }
        return this.findAll(options);
    }
}
