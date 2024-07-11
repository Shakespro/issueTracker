'use strict';

const IssueModel = require('../models').Issue;
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      let projectName = req.params.project;
      const {
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.query;
    
      // Build the query object based on provided query parameters
      let query = { project: projectName };
    
      // Handle each query parameter individually
      if (_id) query['_id'] = ObjectId(_id);
      if (open) query['open'] = open === 'true';
      if (issue_title) query['issue_title'] = issue_title;
      if (issue_text) query['issue_text'] = issue_text;
      if (created_by) query['created_by'] = created_by;
      if (assigned_to) query['assigned_to'] = assigned_to;
      if (status_text) query['status_text'] = status_text;
    
      // Use IssueModel.find() to retrieve issues based on the query
      IssueModel.find(query)
        .then((issues) => {
          res.status(200).json(issues);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        });
    })
    .post(function (req, res) {
      let projectName = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: 'required field(s) missing' });
        return;
      }

      const newIssue = new IssueModel({
        project: projectName,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      });

      newIssue
        .save()
        .then((savedIssue) => {
          res.json(savedIssue);
        })
        .catch((err) => {
          console.error('Error fetching issues:', err); // Log the error
          res.status(500).json({ error: 'Internal server error' });
        });
    })
    .put(function (req, res) {
      let projectName = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      if (!_id) {
        res.json({ error: 'missing _id' });
        return;
      }

      let updates = {};
      if (issue_title) updates['issue_title'] = issue_title;
      if (issue_text) updates['issue_text'] = issue_text;
      if (created_by) updates['created_by'] = created_by;
      if (assigned_to) updates['assigned_to'] = assigned_to;
      if (status_text) updates['status_text'] = status_text;
      if (open !== undefined) updates['open'] = open === 'true';

      if (Object.keys(updates).length === 0) {
        res.json({ error: 'no update field(s) sent', _id });
        return;
      }

      updates['updated_on'] = new Date();

      IssueModel.findByIdAndUpdate(_id, updates, { new: true })
        .then((updatedIssue) => {
          if (!updatedIssue) {
            res.json({ error: 'could not update', _id });
          } else {
            res.json({ result: 'successfully updated', _id });
          }
        })
        .catch((err) => {
          console.error(err);
          res.json({ error: 'could not update', _id });
        });
    })

    .delete(function (req, res) {
      let projectName = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        res.json({ error: 'missing _id' });
        return;
      }

      IssueModel.findByIdAndDelete(_id)
        .then((deletedIssue) => {
          if (!deletedIssue) {
            res.json({ error: 'could not delete', _id });
          } else {
            res.json({ result: 'successfully deleted', _id });
          }
        })
        .catch((err) => {
          console.error(err);
          res.json({ error: 'could not delete', _id });
        });
    });
};
//here
