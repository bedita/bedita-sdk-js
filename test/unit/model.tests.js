
import { Model } from '../../src/model.js';

describe('Model', function() {
    let model = new Model();

    describe('#static Model.schema', () => {
        it('should return a valid json', () => {
            let modelSchema = Model.schema;
            expect(modelSchema).to.be.a('object');
            let jsonSchema = JSON.parse(JSON.stringify(modelSchema));
            expect(modelSchema).to.be.deep.equal(jsonSchema);
        });
    });

    describe('#type', () => {
        it('should return the class name', () => {
            let className = model.type;
            expect(className).to.be.a('string');
            expect(className).to.be.equal('Model');
        });
    });
});
