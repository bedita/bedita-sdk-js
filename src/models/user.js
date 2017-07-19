import { ObjectModel } from './object.js';
import './role.js';

const SCHEMA = {
    type: 'object',
    definitions: ObjectModel.schema.definitions,
    allOf: [
        { $ref: '#/definitions/object' },
        {
            type: 'object',
            properties: {
                username: { type: 'string', maximum: 255 },
                password_hash: { type: 'string', maximum: 255 },
                metadata: {
                    allOf: [
                        { $ref: '#/definitions/metadata' },
                        {
                            type: 'object',
                            properties: {
                                last_login: {
                                    oneOf: [
                                        {
                                            type: 'null',
                                        },
                                        {
                                            type: 'string',
                                            format: 'date-time',
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            },
        },
    ],
};

export class UserModel extends ObjectModel {
    static get schema() {
        return SCHEMA;
    }

    static get relationships() {
        return {
            roles: {
                types: ['roles'],
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
                return Promise.resolve(res);
            })
            .catch(() =>
                Promise.resolve(false)
            );
    }
}
