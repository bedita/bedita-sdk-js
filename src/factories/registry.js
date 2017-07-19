import { Factory } from '@chialab/synapse/src/factory.js';

export class Registry extends Factory {
    initialize(...args) {
        this.models = {};
        this.collections = {};
        return super.initialize(...args);
    }

    registerModel(Model) {
        this.models[Model.prototype.type] = Model;
    }

    getModel(type) {
        return this.models[type];
    }

    hasModel(type) {
        return this.models.hasOwnProperty(type);
    }

    registerCollection(Collection) {
        this.collections[Collection.prototype.type] = Collection;
    }

    getCollection(type) {
        return this.collections[type];
    }

    hasCollection(type) {
        return this.collections.hasOwnProperty(type);
    }
}