import { mongoose } from '../model_common';

const Schema = mongoose.Schema;

const Server = new Schema({

});

export default mongoose.model('server', Server);
