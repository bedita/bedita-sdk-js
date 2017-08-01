import { Collection } from '../collection.js';
import { StreamModel } from '../models/stream.js';
import { MediaModel } from '../models/media.js';
import { MediaCollection } from './media.js';

export class StreamsCollection extends Collection {
    static get Model() {
        return StreamModel;
    }

    upload(fileContent, type, media) {
        if (self.File && fileContent instanceof File && typeof type !== 'string') {
            media = type;
            type = fileContent.type;
        }
        let name;
        if (typeof media === 'string') {
            name = media;
            media = {
                name,
            };
        } else if (media instanceof MediaModel && media.name) {
            name = media.name;
        }
        name = name || `stream_${Date.now()}`;
        return this.factory('api').post(`/streams/upload/${name}`, fileContent, {
            headers: {
                'content-type': type,
            },
        }).then((res) =>
            this.model()
                .then((model) =>
                    model.setFromResponse(res.data)
                        .then(() => Promise.resolve(model))
                )
                .then((streamModel) => {
                    if (media) {
                        let Model = this.factory('registry').getModel(media.type) || MediaModel;
                        let Collection = this.factory('registry').getCollection(media.type) || MediaCollection;
                        return this.initClass(Collection)
                            .then((collection) => {
                                if (!(media instanceof Model)) {
                                    return collection.model(media)
                                        .then((model) =>
                                            collection.post(model)
                                                .then(() =>
                                                    Promise.resolve(model)
                                                )
                                        );
                                }
                                return Promise.resolve(media);
                            }).then((mediaModel) => {
                                mediaModel.addRelationship('streams', streamModel);
                                return Promise.resolve(streamModel);
                            });
                    }
                    return Promise.resolve(streamModel);
                })
        );
    }

    getMinimalPropertiesSet() {
        return ['metadata.url', 'file_name', 'mime_type', 'metadata.version'];
    }
}
