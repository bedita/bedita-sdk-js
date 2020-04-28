import { clone } from '@chialab/proteins';
import { ObjectsCollection } from './objects.js';

export class TrashCollection extends ObjectsCollection {
    fetch(model, options = {}) {
        options = clone(options);
        options.endpoint = `trash/${model.id}`;
        return super.fetch(model, options);
    }

    post(model, options = {}) {
        options = clone(options);
        options.endpoint = `trash/${model.id}`;
        return super.post(model, options);
    }

    delete(model, options = {}) {
        options = clone(options);
        options.endpoint = `trash/${model.id}`;
        return super.delete(model, options);
    }

    findAll(options = {}) {
        options = clone(options);
        options.endpoint = 'trash';
        return super.findAll(options);
    }

    restore(model) {
        return this.post(model, {
            method: 'PATCH',
        });
    }
}
