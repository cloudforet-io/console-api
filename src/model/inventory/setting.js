import { mongoose } from '../model_common';

const Schema = mongoose.Schema;

const Setting = new Schema({

});

export default mongoose.model('setting', Setting);
