import { mongoose } from '../modelCommon';

const Schema = mongoose.Schema;

const ProjectGroupMember = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  role: {
    type: String,
  },
  tags: [Object],
}, { versionKey: false });

export default mongoose.model('projectGroupMember', ProjectGroupMember);
