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

    /**
     * call Collection.findAll with custom endpoint for object_types
     * 
     * @param {Object} options 
     */
    findAll(options = {}) {
        options.endpoint = '/model/object_types'; 
        return super.findAll(options);
    }

    /**
     * filter Types array
     * 
     * @param options as {
     *          filter: filter list with attributes (ex: plugin: 'BEdita/Core')
     *          fields: mask output with fields (ex name, id)
     *      }
     * 
     * @returns Promise of an Array of Objects
     */
    filterTypes(options = {}) {
        return this.findAll(options)
            .then(() => { 
                return this.array; 
            });
    }
}
