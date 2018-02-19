import { mix } from '@chialab/synapse/src/helpers/mixin.js';
import { internal } from '@chialab/synapse/src/helpers/internal.js';
import { Factory } from '@chialab/synapse/src/factory.js';
import { InjectableMixin } from '@chialab/synapse/src/mixins/injectable.js';

// MODELS
export * from './model.js';
import { ObjectModel } from './models/object.js';
import { RoleModel } from './models/role.js';
import { UserModel } from './models/user.js';
import { StreamModel } from './models/stream.js';
import { MediaModel } from './models/media.js';
import { ApplicationModel } from './models/application.js';
import { ObjectTypeModel } from './models/object_type.js';
import { PropertyTypeModel } from './models/property_type.js';
import { PropertyModel } from './models/property.js';

export { ObjectModel };
export { RoleModel };
export { UserModel };
export { StreamModel };
export { MediaModel };
export { ApplicationModel };
export { ObjectTypeModel };
export { PropertyTypeModel };
export { PropertyModel };   

// COLLECTIONS
export * from './collection.js';
export * from './collections/relationships.js';
import { ObjectsCollection } from './collections/objects.js';
import { RolesCollection } from './collections/roles.js';
import { TrashCollection } from './collections/trash.js';
import { UsersCollection } from './collections/users.js';
import { StreamsCollection } from './collections/streams.js';
import { MediaCollection } from './collections/media.js';
import { ApplicationsCollection } from './collections/applications.js';
import { ObjectTypesCollection } from './collections/object_types.js';
import { PropertyTypesCollection } from './collections/property_types.js';
import { PropertiesCollection } from './collections/properties.js';

export { ObjectsCollection };
export { RolesCollection };
export { TrashCollection };
export { UsersCollection };
export { StreamsCollection };
export { MediaCollection };
export { ApplicationsCollection };
export { ObjectTypesCollection };
export { PropertyTypesCollection };
export { PropertiesCollection };

import { Api } from './factories/api.js';
import { Url } from './factories/url.js';
import { Session } from './factories/session.js';
import { Debug } from './factories/debug.js';
import { ModelFactory } from './factories/model.js';

export { Api };
export { Url };
export { ModelFactory };
export { Session };
export { Debug };

export const CORE_MODELS = [
    ObjectModel,
    RoleModel,
    UserModel,
    StreamModel,
    MediaModel,
    ApplicationModel,
    ObjectTypeModel,
    PropertyTypeModel,
    PropertyModel,
];

export const CORE_COLLECTIONS = [
    ObjectsCollection,
    RolesCollection,
    TrashCollection,
    UsersCollection,
    StreamsCollection,
    MediaCollection,
    ApplicationsCollection,
    ObjectTypesCollection,
    PropertyTypesCollection,
    PropertiesCollection,
];

export class Client extends mix(Factory).with(InjectableMixin) {
    static init(options) {
        let client = new this();
        return client.initialize(options)
            .then(() => client);
    }

    static get injectors() {
        return {
            url: Url,
            api: Api,
            model: [ModelFactory, {
                models: CORE_MODELS,
                collections: CORE_COLLECTIONS,
            }],
            session: Session,
            debug: Debug,
        };
    }

    initialize(options = {}) {
        internal(this).options = options;
        return super.initialize(options)
            .then(() => {
                if (options.base) {
                    this.config({
                        base: options.base,
                        apiKey: options.apiKey,
                    });
                }
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

    config(options) {
        this.factory('api').config({
            base: options.base,
            apiKey: options.apiKey,
        });
    }

    getModel(...args) {
        return this.factory('model').getModel(...args);
    }

    registerModel(...args) {
        return this.factory('model').registerModel(...args);
    }

    getCollection(...args) {
        return this.factory('model').getCollection(...args);
    }

    registerCollection(...args) {
        return this.factory('model').registerCollection(...args);
    }

    initCollection(...args) {
        return this.factory('model').initCollection(...args);
    }

    initModel(...args) {
        return this.factory('model').initModel(...args);
    }
}
