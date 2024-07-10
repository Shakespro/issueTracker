const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
require('../db-connection');

chai.use(chaiHttp);

let issue1, issue2;

suite('Functional Tests', function () {
  before(function (done) {
    chai.request(server)
      .post('/api/issues/testing123')
      .set('content-type', 'application/json')
      .send({
        issue_title: 'Issue 1',
        issue_text: 'Functional Test',
        created_by: 'fCC',
        assigned_to: 'Sakhi',
        status_text: 'Not Done',
      })
      .end(function (err, res) {
        issue1 = res.body;
        chai.request(server)
          .post('/api/issues/testing123')
          .set('content-type', 'application/json')
          .send({
            issue_title: 'Issue 2',
            issue_text: 'Functional Test',
            created_by: 'fCC',
            assigned_to: '',
            status_text: '',
          })
          .end(function (err, res) {
            issue2 = res.body;
            done();
          });
      });
  });

  suite('Routing Tests', function () {
    suite('3 Post request Tests', function () {
      test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
        chai.request(server)
          .post('/api/issues/testing123')
          .set('content-type', 'application/json')
          .send({
            issue_title: 'Issue 1',
            issue_text: 'Functional Test',
            created_by: 'fCC',
            assigned_to: 'Sakhi',
            status_text: 'Not Done',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Issue 1');
            assert.equal(res.body.assigned_to, 'Sakhi');
            assert.equal(res.body.created_by, 'fCC');
            assert.equal(res.body.status_text, 'Not Done');
            assert.equal(res.body.issue_text, 'Functional Test');
            done();
          });
      }).timeout(10000);

      test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
        chai.request(server)
          .post('/api/issues/testing123')
          .set('content-type', 'application/json')
          .send({
            issue_title: 'Issue 2',
            issue_text: 'Functional Test',
            created_by: 'fCC',
            assigned_to: '',
            status_text: '',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Issue 2');
            assert.equal(res.body.issue_text, 'Functional Test');
            assert.equal(res.body.created_by, 'fCC');
            done();
          });
      });

      test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
        chai.request(server)
          .post('/api/issues/testing123')
          .set('content-type', 'application/json')
          .send({
            issue_title: 'Issue 3',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'required field(s) missing');
            done();
          });
      });
    });

    suite('4 Get request Tests', function () {
      test('View issues on a project: GET request to /api/issues/{project}', function (done) {
        chai.request(server)
          .get('/api/issues/testing123')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            done();
          });
      });

      test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
        chai.request(server)
          .get('/api/issues/testing123?open=true')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach(issue => {
              assert.equal(issue.open, true);
            });
            done();
          });
      });

      test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
        chai.request(server)
          .get('/api/issues/testing123?open=true&assigned_to=Sakhi')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach(issue => {
              assert.equal(issue.open, true);
              assert.equal(issue.assigned_to, 'Sakhi');
            });
            done();
          });
      });
    });

    suite('5 Put request Tests', function () {
      test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
        chai.request(server)
          .put('/api/issues/testing123')
          .send({
            _id: issue1._id,
            issue_title: 'Updated Title',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, issue1._id);
            done();
          });
      });

      test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
        chai.request(server)
          .put('/api/issues/testing123')
          .send({
            _id: issue1._id,
            issue_title: 'Updated Title',
            issue_text: 'Updated Text',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, issue1._id);
            done();
          });
      });

      test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
        chai.request(server)
          .put('/api/issues/testing123')
          .send({
            issue_title: 'Updated Title',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });

      test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
        chai.request(server)
          .put('/api/issues/testing123')
          .send({
            _id: issue1._id,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.equal(res.body._id, issue1._id);
            done();
          });
      });

      test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
        chai.request(server)
          .put('/api/issues/testing123')
          .send({
            _id: 'invalid_id',
            issue_title: 'Updated Title',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not update');
            assert.equal(res.body._id, 'invalid_id');
            done();
          });
      });
    });

    suite('6 Delete request Tests', function () {
      test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
        chai.request(server)
          .delete('/api/issues/testing123')
          .send({
            _id: issue2._id,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, issue2._id);
            done();
          });
      });

      test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
        chai.request(server)
          .delete('/api/issues/testing123')
          .send({
            _id: 'invalid_id',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body._id, 'invalid_id');
            done();
          });
      });

      test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
        chai.request(server)
          .delete('/api/issues/testing123')
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
    });
  });
});
