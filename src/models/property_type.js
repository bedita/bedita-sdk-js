import { Model } from '../model.js';
import SCHEMA from '../schemas/model/property_type.json';

export class PropertyTypeModel extends Model {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'property_types';
    }
}
