import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const projectSchema = new Schema({

});

export default mongoose.model('project', projectSchema);
