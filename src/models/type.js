import { Model } from '../model.js';

export class TypeModel extends Model {
    get type() {
        return 'object_types';
    }

    getRelationships() {
        return this.relationships || {};
    }
}
