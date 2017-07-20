import { Factory } from '@chialab/synapse/src/factory.js';

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

    getModel(type) {
        if (this.hasModel(type)) {
            return this.models[type];
        }
        this.factory('debug').warn(`registry -> Missing Collection for ${type}`);
    }

    hasModel(type) {
        return this.models.hasOwnProperty(type);
    }

    registerCollection(Collection) {
        this.collections[Collection.prototype.type || Collection.type] = Collection;
    }

    getCollection(type) {
        if (this.hasCollection(type)) {
            return this.collections[type];
        }
        this.factory('debug').warn(`registry -> Missing Collection for ${type}`);
    }

    hasCollection(type) {
        return this.collections.hasOwnProperty(type);
    }
}
