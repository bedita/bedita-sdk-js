import { Model } from '../model.js';
import SCHEMA from '../schemas/admin/applications.json';

export class ApplicationModel extends Model {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'applications';
    }
}
