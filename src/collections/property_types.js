import { Collection } from '../collection.js';
import { PropertyTypeModel } from '../models/property_type.js';

/**
 * PropertyTypes Collection
 */
export class PropertyTypesCollection extends Collection {

    /**
     * Return object type model
     * 
     * @return {Class<PropertyTypeModel>} the PropertyTypeModel
     */
    static get Model() {
        return PropertyTypeModel;
    }

    get defaultEndpoint() {
        return '/model/property_types';
    }

    /**
     * Return minimal properties set for index pages
     * 
     * @return {Promise<Array>} properties set
     */
    getMinimalPropertiesSet() {
        return Promise.resolve(['name']);
    }
}
