import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const infraLayerSchema = new Schema({

});

export default mongoose.model('infraLayer', infraLayerSchema);
