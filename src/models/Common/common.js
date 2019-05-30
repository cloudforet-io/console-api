import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const Common = new Schema({

});

export default mongoose.model('common', Common);
