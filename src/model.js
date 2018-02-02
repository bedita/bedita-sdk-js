import { AjaxModel } from '@chialab/synapse/src/models/ajax.js';
import SchemaModel from '@chialab/schema-model';
import tv4 from 'tv4';

tv4.addFormat('date-time', (data) => {
    if (typeof data === 'string') {
        data = new Date(data);
    }
    if ((data instanceof Date) && !isNaN(data.getTime())) {
        return null;
    }
    return 'Invalid date';
});

const SCHEMA = {
    definitions: {
        metadata: {
            type: 'object',
            additionalProperties: true,
            properties: {
                created: {
                    type: 'string',
                    format: 'date-time',
                },
                modified: {
                    type: 'string',
                    format: 'date-time',
                },
            },
        },
    },
};

export class Model extends AjaxModel {
    static get schema() {
        return SCHEMA;
    }

    static create(type, schema) {
        const Ctr = this;
        return class extends Ctr {
            static get schema() { return schema; }
            get type() { return type; }
        };
    }

    isNew() {
        return !this.id;
    }

    isDeleted() {
        return !!this.$deleted;
    }

    delete() {
        this.reset(true);
        this.tickDeleted();
        this.trigger('deleted');
    }

    setChanges(...args) {
        super.setChanges(...args);
        this.tickModified();
    }

    resetChanges() {
        super.resetChanges();
        this.tickModified(this.metadata && this.metadata.modified || 0);
    }

    hasLocalChanges() {
        let remote = new Date(this.metadata && this.metadata.modified || 0);
        let current = new Date(this.get('$modified'));
        return current > remote;
    }

    clone() {
        return this.initClass(this.constructor)
            .then((clone) => clone.merge(this))
            .then((clone) => {
                clone.resetChanges();
                return Promise.resolve(clone);
            });
    }

    merge(model) {
        this.set(model.toJSON(true));
        return Promise.resolve(this);
    }

    setFromResponse(res) {
        if (res) {
            if (res.id) {
                this.set({
                    id: res.id,
                }, {
                    validate: false,
                    skipChanges: true,
                });
                delete res.id;
            }
            if (res.type) {
                this.set({
                    type: res.type,
                }, {
                    validate: false,
                    skipChanges: true,
                });
                delete res.type;
            }
            if (res.attributes) {
                this.set(res.attributes, {
                    validate: false,
                    skipChanges: true,
                });
                delete res.attributes;
            }
            if (res.meta) {
                let old = this.get('metadata') || {};
                this.set('metadata', SchemaModel.merge(old, res.meta), {
                    validate: false,
                    skipChanges: true,
                });
                this.tickModified(this.metadata && this.metadata.modified || 0);
                delete res.meta;
            }
            delete res.links;
        }
        return super.setFromResponse(res);
    }

    tickModified(date = Date.now()) {
        this.set('$modified', new Date(date).getTime(), { skipChanges: true, validate: false });
    }

    tickDeleted() {
        this.set('$deleted', true, { skipChanges: false, validate: false });
    }

    toJSONApi(stripUndefined, onlyChanges) {
        let res = {};
        let data = this.toJSON(stripUndefined);
        if (data.id) {
            res.id = data.id;
            delete data.id;
        }
        if (data.type) {
            res.type = data.type;
            delete data.type;
        }
        if (onlyChanges) {
            let changed = this.changed();
            for (let k in data) {
                if (changed.indexOf(k) === -1) {
                    delete data[k];
                }
            }
        }
        res.attributes = data;
        return res;
    }
}
