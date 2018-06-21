import clone from '@chialab/proteins/src/clone.js';
import { internal } from '@chialab/synapse/src/helpers/internal.js';
import { AjaxCollection } from '@chialab/synapse/src/collections/ajax.js';
import { Model } from './model.js';

/**
 * @class bedita.Collection
 * @extends AjaxCollection
 * A generic Collection class for BEdita models.
 */
export class Collection extends AjaxCollection {
    /**
     * Create a new Collection constructor which handle the given Model instances.
     * @static
     * @param {Function} Model The constructor of the Collection's instances.
     * @return {Function} The extended Collection
     */
    static create(Model) {
        // dynamically create a class which uses the given Model.
        return class extends Collection {
            static get Model() {
                return Model;
            }
        };
    }

    /**
     * The Model constructor of the Collection's instances.
     * @type {Function}
     * @static
     */
    static get Model() {
        return Model;
    }

    /**
     * The type of the instances.
     * Aliases to `type` property of the Model.
     * @type {String}
     */
    get type() {
        // get the Model constructor for the Collection
        const Model = this.constructor.Model;
        // return Model type
        return Model.prototype.type || Model.type;
    }

    /**
     * The default endpoint to use for fetching models data.
     * @type {String}
     */
    get defaultEndpoint() {
        return null;
    }

    model(data, EntityModel) {
        let resolveModel;
        if (!EntityModel && data && data.type) {
            resolveModel = this.factory('model')
                .getModel(data.type, this.constructor.Model)
                .catch(() => this.constructor.Model);
        } else {
            resolveModel = Promise.resolve(EntityModel || this.constructor.Model);
        }
        return resolveModel.then((Model) => super.model(data, Model));
    }

    execFetch(options = {}) {
        options = clone(options);
        options.method = options.method || 'get';
        return this.factory('api').request(options.endpoint, options);
    }

    fetch(model, options = {}) {
        options = clone(options);
        let api = options.endpoint;
        let id = model.get('id');
        let Entity = options.Model || this.constructor.Model;
        if (!api && id) {
            api = `${this.defaultEndpoint || Entity.prototype.type || Entity.type}/${id}`;
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
                    .then((data) =>
                        this.factory('model').getModel(data.type, this.constructor.Model)
                            .catch(() => Promise.resolve(Entity))
                            .then((Model) => {
                                if (Model && !(model instanceof Model)) {
                                    return this.initClass(Model);
                                }
                                return Promise.resolve(model);
                            })
                            .then((convertedModel) => {
                                convertedModel.resetChanges();
                                return convertedModel.setFromResponse(data);
                            })
                            .catch((err) => {
                                this.factory('debug').error('model convertion ->', err);
                            })
                    )
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
                            if (rel instanceof Collection) {
                                rel.forEach((relModel) => {
                                    let objData = included.find((entry) =>
                                        entry.id === relModel.id && entry.type === relModel.type
                                    );
                                    if (objData) {
                                        promises.push(
                                            relModel.setFromResponse(clone(objData))
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
        options = clone(options);
        options.method = options.method || 'post';
        options.method = options.method.toLowerCase();
        return this.factory('api')[options.method](
            options.endpoint,
            options.body,
            options
        );
    }

    post(model, options = {}) {
        const modelOptions = clone(options);
        const relationshipsOptions = clone(options);
        let api = modelOptions.endpoint;
        if (!api) {
            let id = model.get('id');
            api = this.defaultEndpoint || model.get('type');
            modelOptions.method = 'POST';
            if (id) {
                modelOptions.method = 'PATCH';
                api += `/${id}`;
            }
        }
        if (!api) {
            return Promise.reject();
        }
        modelOptions.endpoint = api;
        if (!modelOptions.body) {
            modelOptions.body = { data: model.toJSONApi() };
        }
        return super.post(model, modelOptions)
            .then(() =>
                model.postRelationships(relationshipsOptions)
            ).then(() => {
                model.resetChanges();
                return Promise.resolve(model);
            });
    }

    afterPost(res) {
        return Promise.resolve(res.data);
    }

    findAll(options = {}) {
        options = clone(options);
        let Entity = options.Model || this.constructor.Model;
        let endpoint = options.endpoint || this.endpoint || this.defaultEndpoint || Entity.prototype.type || Entity.type;
        if (!endpoint) {
            return Promise.reject();
        }
        endpoint = this.factory('api').resolve(endpoint);
        const url = this.factory('url');
        let queryParams = {};
        if (options.sort) {
            queryParams.sort = options.sort;
        }
        if (typeof options.page !== 'undefined') {
            queryParams.page = options.page;
        }
        if (typeof options.pageSize !== 'undefined') {
            queryParams.page_size = options.pageSize;
        }
        if (typeof options.filter !== 'undefined') {
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

        // check if field filter is set, search if fields are valid 
        // for model schema and add them to queryParams
        let fields = [];
        if (Entity.schema && Entity.schema.properties && options.fields) {
            let modelFields = Entity.schema.properties;
            for (let fieldName in modelFields) {
                if (options.fields.indexOf(fieldName) > -1) {
                    fields.push(fieldName);
                }
            }
            if (fields.length) {
                queryParams.fields = fields.join(',');
            }
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
            if (sort) {
                return sort === field || sort === `-${field}`;
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

    /**
     * When the Collection is paginated, update the the models for the requested page.
     * @param {Number} pageNum The requested page number.
     * @return {Promise}
     */
    page(pageNum) {
        // get the options for the last fetch
        let options = internal(this).lastOptions || {};
        // update the page number
        options.page = pageNum;
        // exec a `findAll`
        return this.findAll(options);
    }

    /**
     * Remote model deletion.
     *
     * @param {Model} model The model to delete.
     * @param {Object} options Options for the api call.
     * @return {Promise}
     */
    delete(model, options = {}) {
        options = clone(options);
        let api;
        if (options.endpoint) {
            // the endpoint for model deletion has been provided in the options
            api = options.endpoint;
        } else {
            // check if the model exists in the database in order to generare the endpoint
            let id = model.get('id');
            if (id) {
                // generate the api endpoint
                api = `${this.defaultEndpoint || model.get('type')}/${id}`;
            }
        }
        if (!api) {
            // missing endpoint, cannot delete the model
            return Promise.reject();
        }
        // trigger the `beforeFetch` hook
        return this.beforeFetch(options)
            .then((options) =>
                // exec a DELETE ajax call
                this.factory('api').delete(api, undefined, options)
                    .then((res) =>
                        // trigger the `afterFetch` hook
                        this.afterFetch(res)
                    )
                    .then(() => {
                        // empty delete the model
                        model.delete();
                        // destory model listeners and interactions
                        return model.destroy();
                    })
            );
    }

    /**
     * Get a set of important properties to show in index.
     * @return {Promise<Array<String>>}
     */
    getMinimalPropertiesSet() {
        return Promise.resolve(['id', 'type', 'uname', 'title', 'created', 'modified']);
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

    /**
     * Async method for Collection update.
     * @return {Promise}
     */
    update() {
        return Promise.resolve();
    }
}
