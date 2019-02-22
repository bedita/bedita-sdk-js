import { Collection } from '../collection.js';
import { RelationModel } from '../models/relation';

/**
 * Relations Collection
 */
export class RelationsCollection extends Collection {

    /**
     * Return object type model
     * 
     * @return {Class<RelationModel>} the RelationModel
     */
    static get Model() {
        return RelationModel;
    }

    /**
     * The endpoint for Relations.
     * @type {String}
     */
    get defaultEndpoint() {
        return '/model/realations';
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
