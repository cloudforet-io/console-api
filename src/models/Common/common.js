import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const commonSchema = new Schema({

});

export default mongoose.model('common', commonSchema);
