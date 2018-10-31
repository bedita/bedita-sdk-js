import { Model } from '../model.js';
import SCHEMA from '../schemas/model/property.json';

export class PropertyModel extends Model {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'properties';
    }
}
