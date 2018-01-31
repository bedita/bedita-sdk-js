import { Factory } from '@chialab/synapse/src/factory.js';
import { Model } from '../model';
import { Collection } from '../collection';

export class Registry extends Factory {
    static get models() {
        return [];
    }

    static get collections() {
        return [];
    }

    initialize(options = {}) {
        this.models = {};
        this.collections = {};
        this.modelQueue = {};
        return super.initialize(options)
            .then(() => {
                let collections = (this.constructor.collections || []);
                collections.push(...(options.collections || []));
                collections.forEach((Collection) => {
                    this.registerCollection(Collection);
                });
                let models = (this.constructor.models || []);
                models.push(...(options.models || []));
                models.forEach((Model) => {
                    this.registerModel(Model);
                });
                return Promise.resolve(this);
            });
    }

    registerModel(Model) {
        this.models[Model.prototype.type || Model.type] = Model;
    }

    getModel(type, BaseModel = Model) {
        if (this.hasModel(type)) {
            return Promise.resolve(this.models[type]);
        }
        if (this.modelQueue[type]) {
            return this.modelQueue[type];
        }
        this.modelQueue[type] = this.factory('api').get(`/model/schema/${type}`)
            .then((data) => {
                let TypedModel = BaseModel.create(type, data);
                this.registerModel(TypedModel);
                return Promise.resolve(TypedModel);
            });
        return this.modelQueue[type];
    }

    hasModel(type) {
        return this.models.hasOwnProperty(type);
    }

    registerCollection(Collection) {
        this.collections[Collection.prototype.type || Collection.type] = Collection;
    }

    getCollection(type, BaseCollection = Collection) {
        if (this.hasCollection(type)) {
            return Promise.resolve(this.collections[type]);
        }
        return this.getModel(type)
            .then((Model) => {
                let TypedCollection = BaseCollection.create(Model);
                this.registerCollection(type, TypedCollection);
                return Promise.resolve(TypedCollection);
            });
    }

    hasCollection(type) {
        return this.collections.hasOwnProperty(type);
    }
}
