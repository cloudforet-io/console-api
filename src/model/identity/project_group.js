import { mongoose } from '../model_common';

const Schema = mongoose.Schema;

const Project_group = new Schema({
  project_group_id: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
  },
  parents_project_group: {
    type: String,
  },
  members: [Object],
  tags: [Object],
  created_by: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

export default mongoose.model('projectGroup', Project_group);
