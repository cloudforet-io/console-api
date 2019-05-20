import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const networkSchema = new Schema({

});

export default mongoose.model('network', networkSchema);
