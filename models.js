// models.js
const mongoose = require('mongoose');
const issueSchema = new mongoose.Schema({
  projectID: mongoose.Schema.Types.ObjectId,
  issue_title: String,
  issue_text: String,
  created_on: Date,
  updated_on: Date,
  created_by: String,
  assigned_to: String,
  open: Boolean,
  status_text: String,
});
const projectSchema = new mongoose.Schema({
  name: String,
  issues: [issueSchema],
});

const Issue = mongoose.model('Issue', issueSchema);
const Project = mongoose.model('Project', projectSchema);

module.exports = { Issue, Project };
//here