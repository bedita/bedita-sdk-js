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

    get defaultEndpoint() {
        return '/model/object_types';
    }

    /**
     * Return minimal properties set for index pages
     * 
     * @return {Promise<Array>} properties set
     */
    getMinimalPropertiesSet() {
        return Promise.resolve(['id', 'name', 'is_abstract', 'description']);
    }

    /**
     * call Collection.findAll with custom endpoint for available object_types for a collection
     * 
     * @param {String} relName The relationship name.
     * @param {Object} options 
     */
    findAllByRelationship(relName, options = {}) {
        options.endpoint = `${this.type}?filter[by_relation][name]=${relName}`;
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
            .then(() => this.array);
    }
}
