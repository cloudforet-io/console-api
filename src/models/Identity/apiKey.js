import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const ApiKey = new Schema({

});

export default mongoose.model('apiKey', ApiKey);
