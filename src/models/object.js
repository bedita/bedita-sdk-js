import { BaseModel } from './base.js';
import SCHEMA from '../schemas/objects/objects.json';

export class ObjectModel extends BaseModel {
    static get schema() {
        return SCHEMA;
    }

    static get type() {
        return 'objects';
    }
}
