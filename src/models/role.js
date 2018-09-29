import { BaseModel } from './base.js';
import SCHEMA from '../schemas/objects/roles.json';

export class RoleModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'roles';
    }
}
