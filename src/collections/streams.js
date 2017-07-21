import { Collection } from '../collection.js';
import { StreamModel } from '../models/stream.js';
import { MediaModel } from '../models/media.js';
import { MediaCollection } from './media.js';

export class StreamsCollection extends Collection {
    static get Model() {
        return StreamModel;
    }

    upload(file, media) {
        return this.factory('api').post(`/streams/upload/${file.name}`, file, {
            headers: {
                'content-type': file.type,
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
                                let mediaCreation = Promise.resolve(media);
                                if (!(media instanceof Model)) {
                                    mediaCreation = collection.model(media)
                                }
                                return mediaCreation
                                    .then((model) =>
                                        collection.post(model)
                                            .then(() => Promise.resolve(model))
                                    );
                            }).then((mediaModel) => {
                                streamModel.addRelationship('object', mediaModel);
                                return streamModel.getRelationship('object').update();
                            }).then(() =>
                                Promise.resolve(streamModel)
                            );
                    }
                    return Promise.resolve(streamModel);
                })
        );
    }

    getMinimalPropertiesSet() {
        return ['metadata.url', 'file_name', 'mime_type', 'metadata.version'];
    }
}
