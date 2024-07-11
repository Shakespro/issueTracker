const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(async (req, res) => {
      let projectName = req.params.project;
      try {
        const project = await ProjectModel.findOne({ name: projectName });
        if (!project) {
          res.json([{ error: "project not found" }]);
          return;
        }
        const issues = await IssueModel.find({
          projectID: project._id,
          ...req.query,
        }).select({
          _id: 1,
          issue_title: 1,
          issue_text: 1,
          created_on: 1,
          updated_on: 1,
          created_by: 1,
          assigned_to: 1,
          open: 1,
          status_text: 1,
        });
        if (!issues.length) {
          res.json([{ error: "no issues found" }]);
          return;
        }
        res.json(issues);
      } catch (err) {
        res.json({ error: "could not get issues" });
      }
    })
    .post(async (req, res) => {
      let projectName = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      try {
        let projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          projectModel = new ProjectModel({ name: projectName });
          projectModel = await projectModel.save();
        }
        const issueModel = new IssueModel({
          projectID: projectModel._id,
          issue_title,
          issue_text,
          created_on: new Date(),
          updated_on: new Date(),
          created_by,
          assigned_to: assigned_to || '',
          open: true,
          status_text: status_text || '',
        });
        const issue = await issueModel.save();
        res.json(issue);
      } catch (err) {
        res.json({ error: "could not post issue" });
      }
    })
    .put(async (req, res) => {
      let projectName = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }

      let updateFields = {};
      let hasUpdates = false;
      if (issue_title !== undefined) {
        updateFields.issue_title = issue_title;
        hasUpdates = true;
      }
      if (issue_text !== undefined) {
        updateFields.issue_text = issue_text;
        hasUpdates = true;
      }
      if (created_by !== undefined) {
        updateFields.created_by = created_by;
        hasUpdates = true;
      }
      if (assigned_to !== undefined) {
        updateFields.assigned_to = assigned_to;
        hasUpdates = true;
      }
      if (status_text !== undefined) {
        updateFields.status_text = status_text;
        hasUpdates = true;
      }
      if (open !== undefined) {
        updateFields.open = open;
        hasUpdates = true;
      }
      updateFields.updated_on = new Date();

      try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          res.json({ error: "could not update issue", _id });
          return;
        }

        let issue = await IssueModel.findById(_id);
        if (!issue) {
          res.json({ error: "could not update issue", _id });
          return;
        }

        // CHANGE 1: Update the response when no update fields are sent
        if (!hasUpdates) {
          res.json({ error: 'no update field(s) sent', '_id': _id });
          return;
        }

        issue = await IssueModel.findByIdAndUpdate(
          _id,
          updateFields,
          { new: true }
        );

        res.json({ result: "successfully updated", _id });
      } catch (err) {
        // CHANGE 2: Update the response when there's an error updating the issue
        res.json({ error: 'could not update', '_id': _id });
      }
    })
    .delete(async (req, res) => {
      let projectName = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      try {
        const project = await ProjectModel.findOne({ name: projectName });
        if (!project) {
          res.json({ error: "could not delete", _id });
          return;
        }
        const issue = await IssueModel.findByIdAndDelete(_id);
        if (!issue) {
          res.json({ error: "could not delete", _id });
        } else {
          res.json({ result: "successfully deleted", _id });
        }
      } catch (err) {
        res.json({ error: "could not delete", _id });
      }
    });
};
