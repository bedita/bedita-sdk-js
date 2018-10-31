import { ObjectModel } from './object.js';
import SCHEMA from '../schemas/objects/users.json';

export class UserModel extends ObjectModel {
    static get schema() {
        return {
            allOf: [ObjectModel.schema, SCHEMA],
        };
    }

    static get relations() {
        return {
            roles: {
                types: ['roles'],
                include: true,
            },
        };
    }

    get type() {
        return 'users';
    }

    hasRole(...names) {
        return this.fetchRelationship('roles')
            .then((roles) => {
                let res = false;
                roles.forEach((role) => {
                    if (names.indexOf(role.name) !== -1) {
                        res = true;
                    }
                });
                return res;
            })
            .catch(() =>
                Promise.resolve(false)
            );
    }
}
