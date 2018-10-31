import { Model } from '../model.js';
import SCHEMA from '../schemas/objects/roles.json';

export class RoleModel extends Model {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'roles';
    }
}
