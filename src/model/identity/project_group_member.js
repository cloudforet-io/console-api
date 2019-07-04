import { mongoose } from '../model_common';

const Schema = mongoose.Schema;

const Project_group_member = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  role: {
    type: String,
  },
  tags: [Object],
}, { versionKey: false });

export default mongoose.model('projectGroupMember', Project_group_member);
