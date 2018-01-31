import { Collection } from '../collection.js';
import { RoleModel } from '../models/role.js';

export class RolesCollection extends Collection {
    static get Model() {
        return RoleModel;
    }

    getMinimalPropertiesSet() {
        return Promise.resolve(['id', 'name']);
    }
}
