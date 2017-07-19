import { Factory } from '@chialab/synapse/src/factory.js';
import objectPath from 'object-path';

export class Url extends Factory {
    chunk(key, val) {
        if (val) {
            return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        }
        return `${encodeURIComponent(key)}`;
    }

    serialize(obj, prefix, chunkFn) {
        chunkFn = chunkFn || this.chunk;
        let str = [];
        let keys = Object.keys(obj);
        if (keys.length) {
            for (let p in obj) {
                if (obj.hasOwnProperty(p) && obj[p] !== undefined) {
                    let k = prefix ? `${prefix}[${p}]` : p;
                    let v = obj[p];
                    if (v instanceof Date) {
                        v = v.toISOString();
                    }
                    str.push(
                        (v !== null && typeof v === 'object') ?
                            this.serialize(v, k) :
                            chunkFn(k, `${v}`)
                    );
                }
            }
        } else if (prefix) {
            str.push(chunkFn(prefix));
        }
        return str.join('&');
    }

    unserialize(str) {
        str = decodeURI(str);
        let chunks = str.split('&');
        let res = {};

        for (let i = 0, len = chunks.length; i < len; i++) {
            let chunk = chunks[i].split('=');
            if (chunk[0] && chunk[1]) {
                let key = chunk[0].replace(/\[(.*?)\]/g, '.$1');
                let val = decodeURIComponent(chunk[1]);
                objectPath.set(res, key, val);
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
