import { Factory } from '@chialab/synapse/src/factory.js';

export class Url extends Factory {
    serialize(obj, prefix) {
        let str = [];
        if (Array.isArray(obj)) {
            let paramKey = encodeURIComponent(`${prefix}[]`);
            obj.forEach((val) => {
                str.push(`${paramKey}=${encodeURIComponent(val)}`);
            });
        } else if (typeof obj === 'object') {
            let keys = Object.keys(obj);
            if (keys.length) {
                for (let p in obj) {
                    if (obj.hasOwnProperty(p) && p !== undefined) {
                        let k = prefix ? `${prefix}[${p}]` : p;
                        let v = obj[p];
                        if (v instanceof Date) {
                            v = v.toISOString();
                        }
                        str.push(
                            (v !== null && typeof v === 'object') ?
                                this.serialize(v, k) :
                                `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
                        );
                    }
                }
            } else if (prefix) {
                str.push(`${encodeURIComponent(prefix)}`);
            }
        } else if (prefix) {
            str.push(`${encodeURIComponent(prefix)}`);
        }
        return str.join('&');
    }

    unserialize(str) {
        str = decodeURI(str);
        let chunks = str.split('&');
        let res = {};

        for (let i = 0, len = chunks.length; i < len; i++) {
            let chunk = chunks[i].split('=');
            if (chunk[0].search("\\[\\]") !== -1) {
                chunk[0] = chunk[0].replace(/\[\]$/, '');
                if (typeof res[chunk[0]] === 'undefined') {
                    res[chunk[0]] = [chunk[1]];

                } else {
                    res[chunk[0]].push(chunk[1]);
                }
            } else {
                res[chunk[0]] = chunk[1];
            }
        }

        return res;
    }

    getSearchParams(url) {
        let params = url.split('?').slice(1).join('?');
        return params ? this.unserialize(params) : {};
    }

    getSearchParam(url, key) {
        return this.getSearchParams(url)[key];
    }

    setSearchParams(url, data) {
        let res = this.getSearchParams(url);
        for (let k in data) {
            res[k] = data[k];
        }
        res = this.serialize(res);
        return `${url.split('?')[0]}?${res}`;
    }

    setSearchParam(url, key, value) {
        return this.setSearchParams(url, { [key]: value });
    }

    unsetSearchParam(url, key) {
        return this.setSearchParam(url, key, undefined);
    }
}