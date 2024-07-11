const mongoose = require('mongoose');
const { Schema } = mongoose;

const issueSchema = new Schema({
  projectID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Project' },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  created_by: { type: String, required: true },
  assigned_to: { type: String },
  open: { type: Boolean, default: true },
  status_text: { type: String }
});

const projectSchema = new Schema({
  name: { type: String, required: true }
});

const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

module.exports = { Issue, Project };
