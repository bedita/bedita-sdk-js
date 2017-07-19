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
        return this.constructor.Model.prototype.type;
    }

    get extendable() {
        return false;
    }

    model(data, Entity) {
        if (!Entity && data && data.type) {
            Entity = this.factory('registry').getModel(data.type);
        }
        Entity = Entity || this.constructor.Model;
        return super.model(data, Entity);
    }

    execFetch(options = {}) {
        return this.factory('api').get(options.endpoint, options);
    }

    fetch(model, options = {}) {
        let api = options.endpoint;
        let id = model.get('id');
        if (!api && id) {
            let Entity = options.Model || this.constructor.Model;
            api = `${Entity.prototype.type}/${id}`;
        }
        if (!api) {
            return Promise.reject();
        }
        options.endpoint = api;
        return super.fetch(model, options);
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
                    models.forEach((model, index) => {
                        let rels = model.getRelationships();
                        for (let k in rels) {
                            let rel = rels[k];
                            rel.forEach((relModel) => {
                                let objData = included.find((entry) =>
                                    entry.id === relModel.id && entry.type === relModel.type
                                );
                                if (objData) {
                                    promises.push(
                                        relModel.setFromResponse(Model.clone(objData))
                                    )
                                }
                            });
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
        options.method = options.method || 'post';
        options.method = options.method.toLowerCase();
        return this.factory('api')[options.method](
            options.endpoint,
            options.body,
            options
        );
    }

    post(model, options = {}) {
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
        options.body = { data: model.toJSONApi() };
        return super.post(model, options)
            .then(() =>
                model.postRelationships()
            ).then(() => {
                model.resetChanges();
                return Promise.resolve(model);
            });
    }

    afterPost(res) {
        return Promise.resolve(res.data);
    }

    findAll(options = {}) {
        options = Model.clone(options);
        let Entity = options.Model || this.constructor.Model;
        let endpoint = options.endpoint || this.endpoint || Entity.prototype.type;
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
        return super.findAll(options);
    }

    isSortBy(field) {
        let endpoint = this.endpoint;
        if (endpoint) {
            let sort = this.factory('search').getSearchParam(endpoint, 'sort');
            if (sort) {
                return sort === field || sort === `-${field}`;
            }
        }
        return false;
    }

    sortType() {
        let endpoint = this.endpoint;
        if (endpoint) {
            let sort = this.factory('search').getSearchParam(endpoint, 'sort');
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
                    .then(() => {
                        model.delete();
                        return model.destroy();
                    })
            );
    }

    getMinimalPropertiesSet() {
        let type = this.type;
        if (!type) {
            let firstModel = this.get(0);
            if (firstModel) {
                type = firstModel.type;
            }
        }
        return ['id', 'uname', 'title', 'metadata.created', 'metadata.modified'];
    }
}
