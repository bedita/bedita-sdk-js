import { internal } from '@chialab/synapse/src/helpers/internal.js';
import { AjaxCollection } from '@chialab/synapse/src/collections/ajax.js';
import { Model } from './model.js';

export class Collection extends AjaxCollection {
    static create(Model) {
        return class extends Collection {
            static get Model() {
                return Model;
            }
        };
    }

    static get Model() {
        return Model;
    }

    get type() {
        return this.constructor.Model.prototype.type || this.constructor.Model.type;
    }

    model(data, Entity) {
        if (!Entity && data && data.type) {
            Entity = this.factory('registry').getModel(data.type);
        }
        Entity = Entity || this.constructor.Model;
        return super.model(data, Entity);
    }

    execFetch(options = {}) {
        options = Collection.clone(options);
        options.method = options.method || 'get';
        return this.factory('api').request(options.endpoint, options);
    }

    fetch(model, options = {}) {
        options = Collection.clone(options);
        let api = options.endpoint;
        let id = model.get('id');
        if (!api && id) {
            let Entity = options.Model || this.constructor.Model;
            api = `${Entity.prototype.type || Entity.type}/${id}`;
        }
        if (!api) {
            return Promise.reject();
        }
        options.endpoint = api;
        return this.beforeFetch(options)
            .then((options) =>
                this.execFetch(options)
                    .then((res) =>
                        this.afterFetch(res)
                    )
                    .then((data) => {
                        let modelConvertion = Promise.resolve(model);
                        if (data.type) {
                            const Model = this.factory('registry').getModel(data.type);
                            if (Model && !(model instanceof Model)) {
                                modelConvertion = this.initClass(Model);
                            }
                        }
                        return modelConvertion
                            .then((convertedModel) => {
                                convertedModel.resetChanges();
                                return convertedModel.setFromResponse(data);
                            })
                            .catch((err) => {
                                this.factory('debug').error('model convertion ->', err);
                            });
                    })
            );
    }

    afterFetch(res) {
        if (res && res.meta && res.meta.pagination) {
            this.pagination = res.meta.pagination;
        }
        this.included = res.included || [];
        return Promise.resolve(res && res.data);
    }

    setFromResponse(data) {
        return super.setFromResponse(data)
            .then((models) => {
                let included = this.included;
                let promises = [];
                if (included.length) {
                    models.forEach((model) => {
                        let rels = model.getRelationships() || {};
                        for (let k in rels) {
                            let rel = rels[k];
                            if (Array.isArray(rel)) {
                                rel.forEach((relModel) => {
                                    let objData = included.find((entry) =>
                                        entry.id === relModel.id && entry.type === relModel.type
                                    );
                                    if (objData) {
                                        promises.push(
                                            relModel.setFromResponse(Model.clone(objData))
                                        );
                                    }
                                });
                            }
                        }
                    });
                }
                return Promise.all(promises)
                    .then(() =>
                        Promise.resolve(models)
                    );
            });
    }

    execPost(options = {}) {
        options = Collection.clone(options);
        options.method = options.method || 'post';
        options.method = options.method.toLowerCase();
        return this.factory('api')[options.method](
            options.endpoint,
            options.body,
            options
        );
    }

    post(model, options = {}) {
        options = Collection.clone(options);
        let api = options.endpoint;
        if (!api) {
            let id = model.get('id');
            api = model.get('type');
            options.method = 'POST';
            if (id) {
                options.method = 'PATCH';
                api += `/${id}`;
            }
        }
        if (!api) {
            return Promise.reject();
        }
        options.endpoint = api;
        if (!options.body) {
            options.body = { data: model.toJSONApi() };
        }
        return super.post(model, options)
            .then(() =>
                model.postRelationships(options)
            ).then(() => {
                model.resetChanges();
                return Promise.resolve(model);
            });
    }

    afterPost(res) {
        return Promise.resolve(res.data);
    }

    findAll(options = {}) {
        options = Collection.clone(options);
        let Entity = options.Model || this.constructor.Model;
        let endpoint = options.endpoint || this.endpoint || Entity.prototype.type || Entity.type;
        if (!endpoint) {
            return Promise.reject();
        }
        endpoint = this.factory('api').resolve(endpoint);
        const url = this.factory('url');
        let queryParams = {};
        if (options.sort) {
            queryParams.sort = options.sort;
        }
        if (options.page) {
            queryParams.page = options.page;
        }
        if (options.pageSize) {
            queryParams.page_size = options.pageSize;
        }
        if (options.filter) {
            queryParams.filter = options.filter;
        }
        if (options.search) {
            queryParams.q = options.search;
        }
        let include = [];
        if (Entity.relationships) {
            let rels = Entity.relationships;
            for (let k in rels) {
                if (rels[k].include) {
                    include.push(k);
                }
            }
        }
        if (options.include) {
            options.include.forEach((rel) => {
                if (include.indexOf(rel) === -1) {
                    include.push(rel);
                }
            });
        }
        if (include.length) {
            queryParams.include = include.join(',');
        }
        endpoint = url.setSearchParams(endpoint, queryParams);
        this.endpoint = options.endpoint = endpoint;
        internal(this).lastOptions = options;

        let promise = super.findAll(options);
        if (options.full) {
            // Load all results by fetching all pages one after the other.
            let currentPage = options.page || 1;
            promise = promise.then((res) => {
                if (!this.pagination || this.pagination.page_count <= currentPage) {
                    return Promise.resolve(res);
                }

                return this.getCleanCopy().then((collection) => {
                    options.page = currentPage + 1;
                    return collection.findAll(options).then(() =>
                        this.joinCollection(collection)
                    );
                });
            });
        }

        return promise;
    }

    getQueryParam(param) {
        let options = internal(this).lastOptions || {};
        return options[param];
    }

    isSortBy(field) {
        let endpoint = this.endpoint;
        if (endpoint) {
            let sort = this.factory('url').getSearchParam(endpoint, 'sort');
            let metaField = field.replace('metadata.', '');
            if (sort) {
                return sort === field || sort === `-${field}` ||
                    sort === metaField || sort === `-${metaField}`;
            }
        }
        return false;
    }

    sortType() {
        let endpoint = this.endpoint;
        if (endpoint) {
            let sort = this.factory('url').getSearchParam(endpoint, 'sort');
            if (sort) {
                return sort[0] !== '-' ? 'asc' : 'desc';
            }
        }
        return false;
    }

    page(pageNum) {
        let options = internal(this).lastOptions || {};
        options.page = pageNum;
        return this.findAll(options);
    }

    delete(model, options = {}) {
        options = Collection.clone(options);
        let api = options.endpoint;
        if (!api) {
            let id = model.get('id');
            if (id) {
                api = `${model.get('type')}/${id}`;
            }
        }
        if (!api) {
            return Promise.reject();
        }
        return this.beforeFetch(options)
            .then((options) =>
                this.factory('api').delete(api, undefined, options)
                    .then((res) =>
                        this.afterFetch(res)
                    )
                    .then(() => {
                        model.delete();
                        return model.destroy();
                    })
            );
    }

    getMinimalPropertiesSet() {
        return ['id', 'type', 'uname', 'title', 'metadata.created', 'metadata.modified'];
    }

    /**
     * Merge two collections.
     *
     * @param {Collection} collection Collection to be joined into the current one.
     * @return {Promise}
     */
    joinCollection(collection) {
        return Promise.all(collection.map((model) => this.add(model)));
    }

    /**
     * Get a clean copy of the current collection model.
     *
     * @return {Promise<Collection>}
     */
    getCleanCopy() {
        return this.initClass(this.constructor);
    }

    update() {
        return Promise.resolve();
    }
}
