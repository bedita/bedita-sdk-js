import { Collection } from '../collection.js';
import { RoleModel } from '../models/role.js';

/**
 * @class RolesCollection
 * @extends Collection
 * Handle roles.
 */
export class RolesCollection extends Collection {
    /**
     * @inheritdoc
     * Use RoleModel as default Model constructor.
     */
    static get Model() {
        return RoleModel;
    }

    /**
     * @inheritdoc
     */
    getMinimalPropertiesSet() {
        return Promise.resolve(['id', 'name']);
    }

    /**
     * Retrieve a role by id.
     * @param {Number} roleId
     * @return {RoleModel}
     */
    getById(roleId) {
        return this.array.find((role) => role.id == roleId);
    }

    /**
     * Retrieve a role by name.
     * @param {String} roleName
     * @return {RoleModel}
     */
    getByName(roleName) {
        return this.array.find((role) => role.name === roleName);
    }
}
