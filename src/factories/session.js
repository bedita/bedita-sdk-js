import { internal } from '@chialab/synapse/src/helpers/internal.js';
import { Factory } from '@chialab/synapse/src/factory.js';

export class Session extends Factory {
    getUser() {
        if (this.user) {
            return Promise.resolve(this.user);
        }
        if (!this.factory('api').token) {
            return Promise.reject();
        }
        if (!internal(this).userPromise) {
            const Collection = this.factory('registry').getCollection('users');
            internal(this).userPromise = this.initClass(Collection)
                .then((collection) =>
                    this.factory('api').me()
                        .then((res) =>
                            collection.model()
                                .then((model) =>
                                    model.setFromResponse(res.data)
                                        .then(() => {
                                            this.user = model;
                                            internal(this).userPromise = null;
                                            return Promise.resolve(model);
                                        })
                                )
                        )
                ).catch((res) => {
                    this.factory('api').logout();
                    return Promise.reject(res);
                });
        }
        return internal(this).userPromise;
    }

    isLogged() {
        return !!this.user;
    }

    login(username, password) {
        const apiFactory = this.factory('api');
        return apiFactory.auth(username, password)
            .then((res) =>
                this.onLoginResponse(res)
            );
    }

    onLoginResponse(res) {
        if (res.meta) {
            const Collection = this.factory('registry').getCollection('users');
            return this.initClass(Collection)
                .then((collection) =>
                    collection.model()
                        .then((model) =>
                            model.setFromResponse(res.data)
                                .then(() => {
                                    this.user = model;
                                    this.trigger('login', this.user);
                                    return Promise.resolve(model);
                                })
                        )
                );
        }
        return Promise.reject();
    }

    logout() {
        this.user = null;
        localStorage.removeItem('user.id');
        const apiFactory = this.factory('api');
        apiFactory.logout();
        this.trigger('logout');
    }

    renew() {
        const apiFactory = this.factory('api');
        return apiFactory.renew()
            .then((res) =>
                this.onLoginResponse(res, this.user.id)
            );
    }
}
