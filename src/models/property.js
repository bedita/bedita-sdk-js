import { BaseModel } from './base.js';
import SCHEMA from '../schemas/model/property.json';

export class PropertyModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'properties';
    }
}
