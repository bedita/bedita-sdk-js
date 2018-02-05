import { ObjectModel } from './object.js';
import './role.js';

const SCHEMA = {
    type: 'object',
    definitions: ObjectModel.schema.definitions,
    allOf: [
        { $ref: '#/definitions/object' },
        {
            $id: '{host}/model/schema/user',
            $schema: 'http://json-schema.org/draft-06/schema#',
            type: 'object',
            properties: {
                name: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/name',
                    title: 'Name',
                    description: 'person name, can be NULL',
                },
                deathdate: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                        format: 'date-time',
                    }],
                    $id: '/properties/deathdate',
                    title: 'Deathdate',
                    description: 'date of death, can be NULL',
                },
                company_kind: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/company_kind',
                    title: 'Company Kind',
                    description: 'type of company, can be NULL',
                },
                surname: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/surname',
                    title: 'Surname',
                    description: 'person surname, can be NULL',
                },
                company: {
                    type: 'boolean',
                    $id: '/properties/company',
                    title: 'Company',
                    description: 'is a company, default: false',
                },
                state_name: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/state_name',
                    title: 'State Name',
                    description: 'state, can be NULL',
                },
                country: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/country',
                    title: 'Country',
                    description: 'country, can be NULL',
                },
                company_name: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/company_name',
                    title: 'Company Name',
                    description: 'name of company, can be NULL',
                },
                city: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/city',
                    title: 'City',
                    description: 'city, can be NULL',
                },
                zipcode: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/zipcode',
                    title: 'Zipcode',
                    description: 'zipcode, can be NULL',
                },
                last_login_err: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                        format: 'date-time',
                    }],
                    $id: '/properties/last_login_err',
                    title: 'Last Login Err',
                    description: 'last login filaure datetime',
                    readOnly: true,
                },
                person_title: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/person_title',
                    title: 'Person Title',
                    description: 'person title, for example Sir, Madame, Prof, Doct, ecc., can be NULL',
                },
                num_login_err: {
                    type: 'integer',
                    $id: '/properties/num_login_err',
                    title: 'Num Login Err',
                    description: 'number of consecutive login failures',
                    readOnly: true,
                    default: 0,
                },
                phone: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/phone',
                    title: 'Phone',
                    description: 'first phone number, can be NULL',
                },
                birthdate: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                        format: 'date-time',
                    }],
                    $id: '/properties/birthdate',
                    title: 'Birthdate',
                    description: 'date of birth, can be NULL',
                },
                gender: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/gender',
                    title: 'Gender',
                    description: 'gender, for example male, female, can be NULL',
                },
                vat_number: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/vat_number',
                    title: 'Vat Number',
                    description: 'value added tax identification number (VAT)',
                },
                national_id_number: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                    }],
                    $id: '/properties/national_id_number',
                    title: 'National Id Number',
                    description: 'national identification number (like SSN in USA or NI number in UK)',
                },
                username: {
                    type: 'string',
                    $id: '/properties/username',
                    title: 'Username',
                    description: 'login user name',
                    maxLength: 100,
                },
                password_hash: {
                    type: 'string',
                    $id: '/properties/password_hash',
                    title: 'Password',
                    description: 'login user password',
                    maxLength: 100,
                },
                website: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                        format: 'uri',
                    }],
                    $id: '/properties/website',
                    title: 'Website',
                    description: 'website url, can be NULL',
                },
                street_address: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                        contentMediaType: 'text/html',
                    }],
                    $id: '/properties/street_address',
                    title: 'Street Address',
                    description: 'address street, can be NULL',
                },
                email: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                        format: 'email',
                    }],
                    $id: '/properties/email',
                    title: 'Email',
                    description: 'first email, can be NULL',
                },
                blocked: {
                    type: 'boolean',
                    $id: '/properties/blocked',
                    title: 'Blocked',
                    description: 'user blocked flag',
                    readOnly: true,
                    default: false,
                },
                last_login: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                        format: 'date-time',
                    }],
                    $id: '/properties/last_login',
                    title: 'Last Login',
                    description: 'last succcessful login datetime',
                    readOnly: true,
                },
                verified: {
                    oneOf: [{
                        type: 'null',
                    }, {
                        type: 'string',
                        format: 'date-time',
                    }],
                    $id: '/properties/verified',
                    title: 'Verified',
                    description: 'Timestamp at which the user became verified',
                    readOnly: true,
                },
            },
        },
    ],
    required: ['username'],
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
