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
      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && open === undefined) {
        res.json({ error: "no update field(s) sent", _id });
        return;
      }
      try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          throw new Error("project not found");
        }
        let issue = await IssueModel.findByIdAndUpdate(
          _id,
          { ...req.body, updated_on: new Date() },
          { new: true }
        );
        if (!issue) {
          res.json({ error: "could not update issue", _id });
        } else {
          res.json({ result: "successfully updated", _id });
        }
      } catch (err) {
        res.json({ error: "could not update", _id });
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
