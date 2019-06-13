import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const Setting = new Schema({

});

export default mongoose.model('setting', Setting);
