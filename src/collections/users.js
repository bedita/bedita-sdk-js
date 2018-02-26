import { Collection } from '../collection.js';
import { UserModel } from '../models/user.js';

/**
 * @class UsersCollection
 * @extends Collection
 * Handle users.
 */
export class UsersCollection extends Collection {
    /**
     * @inheritdoc
     * Use UserModel as default Model constructor.
     */
    static get Model() {
        return UserModel;
    }

    /**
     * @inheritdoc
     */
    getMinimalPropertiesSet() {
        return Promise.resolve(['id', 'email', 'title', 'username', 'last_login']);
    }
}
