import { Model } from '../model.js';
import SCHEMA from '../schemas/objects/objects.json';

export class ObjectModel extends Model {
    static get schema() {
        return SCHEMA;
    }

    static get type() {
        return 'objects';
    }
}
