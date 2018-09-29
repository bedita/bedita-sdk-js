import { BaseModel } from './base.js';
import SCHEMA from '../schemas/admin/applications.json';

export class ApplicationModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'applications';
    }
}
