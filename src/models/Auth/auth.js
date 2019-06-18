import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const Auth = new Schema({

});

export default mongoose.model('auth', Auth);
