import { Collection } from '../collection.js';
import { UserModel } from '../models/user.js';

export class UsersCollection extends Collection {
    static get Model() {
        return UserModel;
    }

    getMinimalPropertiesSet() {
        return ['id', 'email', 'title', 'username', 'metadata.last_login'];
    }
}
