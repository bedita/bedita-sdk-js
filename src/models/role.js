import { BaseModel } from './base.js';

const SCHEMA = {
    type: 'object',
    $id: '{host}/model/schema/roles',
    $schema: 'http://json-schema.org/draft-06/schema#',
    properties: {
        name: {
            type: 'string',
            $id: '/properties/name',
            title: 'Name',
            description: 'role unique name',
            maxLength: 32,
        },
        description: {
            oneOf: [{
                type: 'null',
            }, {
                type: 'string',
                contentMediaType: 'text/html',
            }],
            $id: '/properties/description',
            title: 'Description',
            description: 'role description',
        },
        unchangeable: {
            type: 'boolean',
            $id: '/properties/unchangeable',
            title: 'Unchangeable',
            description: 'role data not modifiable (default:false)',
            readOnly: true,
            default: false,
        },
        created: {
            oneOf: [{
                type: 'null',
            }, {
                type: 'string',
                format: 'date-time',
            }],
            $id: '/properties/created',
            title: 'Created',
            description: 'creation date',
            readOnly: true,
        },
        modified: {
            oneOf: [{
                type: 'null',
            }, {
                type: 'string',
                format: 'date-time',
            }],
            $id: '/properties/modified',
            title: 'Modified',
            description: 'last modification date',
            readOnly: true,
        },
    },
    required: ['name'],
};

export class RoleModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'roles';
    }
}
