import { mongoose } from '../model_common';

const Schema = mongoose.Schema;

const Common = new Schema({

});

export default mongoose.model('common', Common);
