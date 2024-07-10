const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const IssueSchema = new Schema({
  projectID: { type: mongoose.Types.ObjectId, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, require: true },
  created_on: Date,
  updated_on: Date,
  created_by: { type: String, required: true },
  assigned_to: String,
  open: Boolean,
  status_text: String,
});
const Issue = mongoose.model('Issue', IssueSchema);

const ProjectSchema = new Schema({
  name: { type: String, required: true },
});
const Project = mongoose.model('Project', ProjectSchema);

exports.Issue = Issue;
exports.Project = Project;
