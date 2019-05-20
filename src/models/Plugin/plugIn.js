import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const plugInSchema = new Schema({

});

export default mongoose.model('plugIn', plugInSchema);
