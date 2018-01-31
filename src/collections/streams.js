import { Collection } from '../collection.js';
import { StreamModel } from '../models/stream.js';
import { MediaModel } from '../models/media.js';
import { MediaCollection } from './media.js';

export class StreamsCollection extends Collection {
    static get Model() {
        return StreamModel;
    }

    upload(media, fileContent, type, base64) {
        let name = media.name;
        if (!type && self.File && fileContent instanceof self.File) {
            name = name || fileContent.name;
            type = type || fileContent.type;
        }
        name = name || `stream_${Date.now()}`;
        let headers = {
            'content-type': type,
        };
        if (base64) {
            headers['content-transfer-encoding'] = 'base64';
        }
        return this.factory('api').post(`/streams/upload/${name}`, fileContent, {
            headers,
        }).then((res) =>
            this.model()
                .then((model) =>
                    model.setFromResponse(res.data)
                        .then(() => Promise.resolve(model))
                )
                .then((streamModel) => {
                    if (media) {
                        let mediaPromise = Promise.resolve(media);
                        if (!(media instanceof MediaModel)) {
                            return this.factory('registry').getCollection(media.type)
                                .catch(() => MediaCollection)
                                .then((Collection) => this.initClass(Collection))
                                .then((collection) =>
                                    collection.model(media)
                                        .then((model) =>
                                            collection.post(model)
                                                .then(() =>
                                                    Promise.resolve(model)
                                                )
                                        )
                                );
                        }
                        return mediaPromise.then((mediaModel) => {
                            if (!mediaModel.name) {
                                mediaModel.set('name', name, { validate: false });
                            }
                            mediaModel.addRelationship('streams', streamModel);
                            return Promise.resolve(streamModel);
                        });
                    }
                    return Promise.resolve(streamModel);
                })
        );
    }

    getMinimalPropertiesSet() {
        return Promise.resolve(['metadata.url', 'file_name', 'mime_type', 'metadata.version']);
    }
}
