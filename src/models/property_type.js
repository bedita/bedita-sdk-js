import { BaseModel } from './base.js';
import SCHEMA from '../schemas/model/property_type.json';

export class PropertyTypeModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'property_types';
    }
}
