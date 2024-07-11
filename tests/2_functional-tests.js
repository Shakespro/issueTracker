const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const assert = chai.assert;

chai.use(chaiHttp);

let issue1, issue2;

describe('Functional Tests', function() {
  before(function(done) {
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
      .end(function(err, res) {
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
          .end(function(err, res) {
            issue2 = res.body;
            done();
          });
      });
  });

  describe('Routing Tests', function() {
    describe('PUT request Tests', function() {
      it('PUT request to /api/issues/{project} with no update fields', (done) => {
        chai.request(server)
          .put('/api/issues/testing123')
          .send({
            _id: issue1._id,
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'no update field(s) sent', '_id': issue1._id });
            done();
          });
      });

      it('PUT request to /api/issues/{project} with error', (done) => {
        chai.request(server)
          .put('/api/issues/testing123')
          .send({
            _id: '123456789',
            issue_title: 'Updated Title',
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'could not update', '_id': '123456789' });
            done();
          });
      });
    });
  });
});
