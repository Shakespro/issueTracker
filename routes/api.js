const IssueModel = require('../db-connection').Issue;
const ProjectModel = require('../db-connection').Project;

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(async (req, res) => {
      let projectName = req.params.project;
      let filter = { projectID: (await ProjectModel.findOne({ name: projectName }))._id };
      Object.keys(req.query).forEach(key => {
        filter[key] = req.query[key];
      });
      const issues = await IssueModel.find(filter);
      res.json(issues);
    })
    .post(async (req, res) => {
      let projectName = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const project = await ProjectModel.findOneAndUpdate(
        { name: projectName },
        { name: projectName },
        { upsert: true, new: true }
      );

      const newIssue = new IssueModel({
        projectID: project._id,
        issue_title,
        issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by,
        assigned_to: assigned_to || '',
        open: true,
        status_text: status_text || '',
      });

      await newIssue.save();
      res.json(newIssue);
    })
    .put(async (req, res) => {
      let projectName = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id', _id });
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

      if (!hasUpdates) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          return res.json({ error: 'could not update issue', _id });
        }

        const issue = await IssueModel.findById(_id);
        if (!issue) {
          return res.json({ error: 'could not update issue', _id });
        }

        const updatedIssue = await IssueModel.findByIdAndUpdate(
          _id,
          updateFields,
          { new: true }
        );

        return res.json({ result: 'successfully updated', _id: updatedIssue._id });
      } catch (err) {
        return res.json({ error: 'could not update', _id });
      }
    })
    .delete(async (req, res) => {
      const { _id } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        const deletedIssue = await IssueModel.findByIdAndRemove(_id);
        if (!deletedIssue) {
          return res.json({ error: 'could not delete', _id });
        }
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};
