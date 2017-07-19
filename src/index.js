import { mix } from '@chialab/synapse/src/helpers/mixin.js';
import { Factory } from '@chialab/synapse/src/factory.js';
import { InjectableMixin } from '@chialab/synapse/src/mixins/injectable.js';

export * from './model.js';
export * from './models/role.js';
export * from './models/type.js';
export * from './models/object.js';
export * from './models/user.js';
export * from './collection.js';
export * from './collections/relationships.js';
export * from './collections/types.js';
export * from './collections/roles.js';
export * from './collections/users.js';

import { Api } from './factories/api.js';
import { Url } from './factories/url.js';
import { Registry } from './factories/registry.js';

export { Api };
export { Url };
export { Registry };

export class Client extends mix(Factory).with(InjectableMixin) {
    static get injectors() {
        return {
            'url': Url,
            'api': Api,
            'registry': Registry,
        };
    }

    constructor(options) {
        super();
        this.addReadyPromise(
            this.initialize(options)
        );
    }

    initialize(options) {
        return super.initialize(options)
            .then(() => {
                const api = this.factory('api');
                api.config(options);
                api.restore();
                return Promise.resolve();
            });
    }

    getModel(type) {
        return this.factory('registry').getModel(type);
    }

    registerModel(Ctr) {
        this.factory('registry').registerModel(Ctr);
    }

    getCollection(type) {
        return this.factory('registry').getCollection(type);
    }

    registerCollection(Ctr) {
        this.factory('registry').registerCollection(Ctr);
    }
}