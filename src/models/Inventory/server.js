import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const Server = new Schema({

});

export default mongoose.model('server', Server);
