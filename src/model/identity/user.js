import { mongoose } from '../model_common';

const Schema = mongoose.Schema;

const User = new Schema({
  userId: String,
  password: String,
  name: String,
  email: String,
  mobile: Number,
  group: String,
  language: String,
  timezone: String,
  tags: [Object],
  domainId: String,
  admin: { type: Boolean, default: false },
  created_date: { type: Date, default: Date.now },
}, { versionKey: false });

User.statics.create = function (userId, password, name, email, mobile, group, language, timezone, tags, domainId) {
  const user = new this({
    userId,
    password,
    name,
    email,
    mobile,
    group,
    language,
    timezone,
    tags,
    domainId,
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
