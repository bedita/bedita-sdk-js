import { Model } from '../model.js';
import SCHEMA from '../schemas/model/relation.json';

export class RelationModel extends Model {
    static get schema() {
        return SCHEMA;
    }

    get type() {
        return 'relations';
    }
}
