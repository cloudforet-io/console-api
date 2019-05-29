import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const authSchema = new Schema({

});

export default mongoose.model('auth', authSchema);
