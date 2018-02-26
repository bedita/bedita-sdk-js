import { Factory } from '@chialab/synapse/src/factory.js';
import { UrlHelper } from '@chialab/synapse/src/helpers/url.js';
import { clone } from '@chialab/proteins/src/clone.js';

const TOKEN_KEY = 'be.accessToken';
const RENEW_TOKEN_KEY = 'be.renewToken';

let queue = Promise.resolve();

export class Api extends Factory {
    get storage() {
        return this.options && this.options.storage || localStorage;
    }

    initialize(options) {
        if (options) {
            this.config(options);
        }
        return super.initialize(options);
    }

    config(options = {}) {
        this.options = options;
        this.restore();
    }

    restore() {
        let token = this.storage.getItem(TOKEN_KEY);
        let renew = this.storage.getItem(RENEW_TOKEN_KEY);
        if (token) {
            this.setAccessToken(token);
        }
        if (renew) {
            this.setRenewToken(renew);
        }
    }

    resolve(endpoint) {
        if (!this.options.base) {
            throw new Error('Missing BEdita base api url');
        }
        if (endpoint.indexOf(this.options.base) !== 0) {
            endpoint = UrlHelper.join(this.options.base, endpoint);
        }
        return endpoint;
    }

    request(api, options = {}) {
        let url = this.resolve(api);
        options.headers = options.headers || {};
        options.headers['accept'] = 'application/vnd.api+json';
        options.headers['x-requested-with'] = 'XMLHttpRequest';
        if (this.options.apiKey) {
            options.headers['x-api-key'] = this.options.apiKey;
        }
        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }
        if (options.body) {
            if (Object.prototype.toString.call(options.body) === '[object Object]') {
                options.headers['content-type'] = 'application/json';
                options.body = JSON.stringify(options.body);
            }
            if (!options.headers['content-type']) {
                options.headers['content-type'] = 'application/x-www-form-urlencoded';
            }
        }
        this.factory('debug').log(`api -> [${(options.method || 'get').toUpperCase()}]`, url);
        return fetch(url, options)
            .then((res) =>
                res.text()
                    .then((json) => {
                        if (json) {
                            json = JSON.parse(json);
                        }
                        if (res.ok) {
                            return Promise.resolve(json);
                        }
                        return Promise.reject(json);
                    })
            )
            .catch((res) => {
                if (this.token && res && res.error && res.error.status == 401 && res.error.title === 'Expired token') {
                    return this.renew()
                        .catch(() => Promise.reject(res))
                        .then(() => this.request(api, options));
                }
                return Promise.reject(res);
            });
    }

    queue(fn) {
        queue = queue
            .catch(() => Promise.resolve())
            .then(() => fn());
        
        return queue;
    }

    get(api, options) {
        return this.queue(() => this.request(api, options));
    }

    post(api, data, options) {
        options = options ? clone(options) : {};
        options.body = data;
        options.method = 'POST';
        return this.queue(() => this.request(api, options));
    }

    patch(api, data, options) {
        options = options ? clone(options) : {};
        options.body = data;
        options.method = 'PATCH';
        return this.queue(() => this.request(api, options));
    }

    delete(api, data, options) {
        options = options ? clone(options) : {};
        options.body = data;
        options.method = 'DELETE';
        options.headers = options.headers || {};
        options.headers['content-type'] = 'application/vnd.api+json';
        return this.queue(() => this.request(api, options));
    }

    unsetAccessToken() {
        this.token = null;
        this.storage.removeItem(TOKEN_KEY, this.token);
    }

    setAccessToken(token) {
        this.token = token;
        this.storage.setItem(TOKEN_KEY, this.token);
    }

    unsetRenewToken() {
        this.renewToken = null;
        this.storage.removeItem(RENEW_TOKEN_KEY, this.token);
    }

    setRenewToken(token) {
        this.renewToken = token;
        this.storage.setItem(RENEW_TOKEN_KEY, this.renewToken);
    }

    auth(username, password) {
        return this.post('auth', this.factory('url').serialize({
            username,
            password,
        })).then((res) => {
            this.onAuth(res);
            return this.me()
                .then((userRes) => {
                    userRes.meta = userRes.meta || {};
                    userRes.meta.jwt = res.meta.jwt;
                    userRes.meta.renew = res.meta.renew;
                    return Promise.resolve(userRes);
                });
        });
    }

    renew() {
        if (!this.renewToken) {
            throw new Error('Missing renew token');
        }
        let token = this.token;
        this.token = this.renewToken;
        return this.request('auth', { method: 'POST' })
            .then((res) => {
                this.onAuth(res);
                return Promise.resolve(res);
            })
            .catch((err) => {
                this.token = token;
                return Promise.reject(err);
            });
    }

    onAuth(res) {
        if (res.meta) {
            this.setAccessToken(res.meta.jwt);
            this.setRenewToken(res.meta.renew);
        }
    }

    me() {
        return this.get('auth');
    }

    logout() {
        this.unsetAccessToken();
        this.unsetRenewToken();
    }

    /**
     * get all available object types flatten to their name attribute
     * 
     * @returns Promise
     */
    types() {
        return this.get('model/object_types')
            .then((res) => {
                if (res && res.data) {
                    return Promise.resolve(
                        res.data.map((type) => type.attributes.name)
                    );
                }
                return Promise.resolve([]);
            });
    }
}
