const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const assert = chai.assert;

chai.use(chaiHttp);

let testIssueId;

describe('Functional Tests', function() {
  describe('POST /api/issues/{project}', function() {
    it('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/testing')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'Functional Test - Every field filled in',
          created_by: 'Tester',
          assigned_to: 'Assignee',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test Issue');
          assert.equal(res.body.issue_text, 'Functional Test - Every field filled in');
          assert.equal(res.body.created_by, 'Tester');
          assert.equal(res.body.assigned_to, 'Assignee');
          assert.equal(res.body.status_text, 'In Progress');
          testIssueId = res.body._id; // Store the ID for later use in other tests
          done();
        });
    });

    it('Create an issue with required fields only', function(done) {
      chai.request(server)
        .post('/api/issues/testing')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'Functional Test - Required fields only',
          created_by: 'Tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test Issue');
          assert.equal(res.body.issue_text, 'Functional Test - Required fields only');
          assert.equal(res.body.created_by, 'Tester');
          done();
        });
    });

    it('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/testing')
        .send({
          issue_text: 'Functional Test - Missing required fields',
          created_by: 'Tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  describe('PUT /api/issues/{project}', function() {
    it('Update an issue with valid _id', function(done) {
      chai.request(server)
        .put('/api/issues/testing')
        .send({
          _id: testIssueId,
          issue_title: 'Updated Test Issue'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testIssueId);
          done();
        });
    });

    it('Update an issue with invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/testing')
        .send({
          _id: 'invalid_id',
          issue_title: 'Updated Test Issue'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          assert.equal(res.body._id, 'invalid_id');
          done();
        });
    });

    it('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/testing')
        .send({
          issue_title: 'Updated Test Issue'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    it('Update an issue with no update fields', function(done) {
      chai.request(server)
        .put('/api/issues/testing')
        .send({
          _id: testIssueId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, testIssueId);
          done();
        });
    });
  });
});
