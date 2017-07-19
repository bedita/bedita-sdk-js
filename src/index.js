import { mix } from '@chialab/synapse/src/helpers/mixin.js';
import { internal } from '@chialab/synapse/src/helpers/internal.js';
import { Factory } from '@chialab/synapse/src/factory.js';
import { InjectableMixin } from '@chialab/synapse/src/mixins/injectable.js';

// MODELS
export * from './model.js';
export * from './models/date_range.js';
export * from './models/role.js';
export * from './models/type.js';
export * from './models/object.js';
export * from './models/user.js';

// COLLECTIONS
export * from './collection.js';
export * from './collections/relationships.js';
export * from './collections/types.js';
export * from './collections/roles.js';
export * from './collections/objects.js';
export * from './collections/users.js';

import { Api } from './factories/api.js';
import { Url } from './factories/url.js';
import { Registry } from './factories/registry.js';
import { Session } from './factories/session.js';
import { Debug } from './factories/debug.js';

export { Api };
export { Url };
export { Registry };
export { Session };
export { Debug };

export class Client extends mix(Factory).with(InjectableMixin) {
    static get injectors() {
        return {
            url: Url,
            api: Api,
            registry: Registry,
            session: Session,
            debug: Debug,
        };
    }

    constructor(options) {
        super();
        if (!this.getContext()) {
            this.addReadyPromise(
                this.initialize(options)
            );
        }
    }

    initialize(options) {
        internal(this).options = options;
        return super.initialize(options)
            .then(() => {
                this.factory('api').config(options);
                if (Array.isArray(options.models)) {
                    options.models.forEach((Model) => {
                        this.registerModel(Model);
                    });
                }
                if (Array.isArray(options.collections)) {
                    options.collections.forEach((Collection) => {
                        this.registerCollection(Collection);
                    });
                }
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
