import { Collection } from '../collection.js';
import { TypeModel } from '../models/type.js';

export class TypesCollection extends Collection {
    static get Model() {
        return TypeModel;
    }

    findAllByRelationship(relName, options = {}) {
        options.endpoint = `${this.type}?filter[by_relation][name]=${relName}`;
        return super.findAll(options);
    }
}
