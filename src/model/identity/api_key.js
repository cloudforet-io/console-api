import { mongoose } from '../model_common';

const Schema = mongoose.Schema;

const Api_key = new Schema({

});

export default mongoose.model('apiKey', Api_key);
