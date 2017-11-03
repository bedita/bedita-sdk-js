import { Collection } from '../collection.js';
import { ObjectTypeModel } from '../models/object_type.js';

/**
 * Object Types Collection
 */
export class ObjectTypesCollection extends Collection {

    /**
     * Return object type model
     * 
     * @return {ObjectTypeModel} object type model
     */
    static get Model() {
        return ObjectTypeModel;
    }

    /**
     * Return minimal properties set for index pages
     * 
     * @return {Array} properties set
     */
    getMinimalPropertiesSet() {
        return ['id', 'name', 'is_abstract', 'description'];
    }
}
