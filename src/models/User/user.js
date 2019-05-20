import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  user_name: String,
  password: String,
  user_first_name: String,
  user_last_name: String,
  email_address: String,
  created_date: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.model('user', UserSchema);
