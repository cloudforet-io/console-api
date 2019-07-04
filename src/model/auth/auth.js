import { mongoose } from '../model_common';

const Schema = mongoose.Schema;

const Auth = new Schema({

});

export default mongoose.model('auth', Auth);
