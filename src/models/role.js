import { BaseModel } from './base.js';

const SCHEMA = {
    definitions: BaseModel.schema.definitions,
    type: 'object',
    properties: {
        id: { type: 'string', maximum: 255 },
        name: { type: 'string', maximum: 255 },
        description: {
            oneOf: [
                { type: 'null' },
                { type: 'string' },
            ],
        },
        metadata: {
            $ref: '#/definitions/metadata',
        },
    },
};

export class RoleModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'roles';
    }
}
