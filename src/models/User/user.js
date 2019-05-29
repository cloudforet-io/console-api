import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  user_name: String,
  password: String,
  user_first_name: String,
  user_last_name: String,
  email_address: String,
  admin: { type: Boolean, default: false },
  created_date: { type: Date, default: Date.now },
}, { versionKey: false });


// create new User document
// eslint-disable-next-line max-len
UserSchema.statics.create = function (user_name, password, user_first_name, user_last_name, email_address, admin) {
  const user = new this({
    user_name,
    password,
    user_first_name,
    user_last_name,
    email_address,
    admin,
  });

  // return the Promise
  return user.save();
};

// find one user by using username
UserSchema.statics.findOneByUsername = function (user_name) {
  return this.findOne({
    user_name,
  }).exec();
};

// verify the password of the User documment
UserSchema.methods.verify = function (password) {
  return this.password === password;
};

UserSchema.methods.assignAdmin = function () {
  this.admin = true;
  return this.save();
};

export default mongoose.model('user', UserSchema);
