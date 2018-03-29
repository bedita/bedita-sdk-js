import { Collection } from '../collection.js';
import { RelationModel } from '../models/relation.js';

/**
 * Relations Collection
 */
export class RelationsCollection extends Collection {

    /**
     * Return releation model
     * 
     * @return {Function<ObjectTypeModel>} releation model
     */
    static get Model() {
        return RelationModel;
    }

    /**
     * The endpoint for Relations.
     * @type {String}
     */
    get defaultEndpoint() {
        return '/model/relations';
    }

    /**
     * Return minimal properties set for index pages
     * 
     * @return {Promise<Array>} properties set
     */
    getMinimalPropertiesSet() {
        return Promise.resolve(['id', 'name', 'inverse_name']);
    }

    /**
     * Fetch a list of left relations for object type.
     * @param {string} type The object type name
     * @return {Promise<RelationsCollection>}
     */
    findAllLeftByObjectType(type) {
        return this.findAll({ endpoint: `object_types/${type}/left_relations` });
    }

    /**
     * Fetch a list of right relations for object type.
     * @param {string} type The object type name
     * @return {Promise<RelationsCollection>}
     */
    findAllRightByObjectType(type) {
        return this.findAll({ endpoint: `object_types/${type}/right_relations` });
    }
}
