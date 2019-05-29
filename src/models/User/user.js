import { mongoose } from '../modelCommon';
const Schema = mongoose.Schema;

const User = new Schema({
  user_name: String,
  password: String,
  user_first_name: String,
  user_last_name: String,
  email_address: String,
  admin: { type: Boolean, default: false },
  created_date: { type: Date, default: Date.now },
}, { versionKey: false });

User.statics.create = function (user_name, password, user_first_name, user_last_name, email_address, admin) {
  const user = new this({
    user_name,
    password,
    user_first_name,
    user_last_name,
    email_address,
    admin,
  });
  return user;
};

// verify the password of the User documment
User.methods.verify = function (password) {
  return this.password === password;
};

User.methods.assignAdmin = function () {
  this.admin = true;
  return this;
};

export default mongoose.model('user', User);
