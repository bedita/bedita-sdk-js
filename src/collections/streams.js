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
                    model.setFromResponse(res.data).then(() => model)
                )
                .then((streamModel) => {
                    if (!media) {
                        return streamModel;
                    }
                    return this.factory('model').getCollection(media.type)
                        .catch(() => MediaCollection)
                        .then((Collection) => this.initClass(Collection))
                        .then((collection) => {
                            let mediaPromise = Promise.resolve(media);
                            if (!(media instanceof MediaModel)) {
                                mediaPromise = collection.model(media);
                            }
                            return mediaPromise.then((mediaModel) => {
                                streamModel.addRelationship('object', mediaModel);
                                return streamModel.postRelationships()
                                    .then(() => {
                                        if (!mediaModel.name) {
                                            mediaModel.set('name', name, { validate: false });
                                        }
                                        return collection.post(mediaModel).then(() => mediaModel);
                                    });
                            });
                        });
                })
        );
    }

    getMinimalPropertiesSet() {
        return Promise.resolve(['url', 'file_name', 'mime_type', 'version']);
    }
}
