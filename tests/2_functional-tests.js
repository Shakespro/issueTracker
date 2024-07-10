const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
require("../db-connection");

chai.use(chaiHttp);

let issue1, issue2;

suite("Functional Tests", function() {
  before(function(done) {
    chai.request(server)
      .post("/api/issues/testing123")
      .set("content-type", "application/json")
      .send({
        issue_title: "Issue 1",
        issue_text: "Functional Test",
        created_by: "fCC",
        assigned_to: "Sakhi",
        status_text: "Not Done",
      })
      .end(function(err, res) {
        issue1 = res.body;
        chai.request(server)
          .post("/api/issues/testing123")
          .set("content-type", "application/json")
          .send({
            issue_title: "Issue 2",
            issue_text: "Functional Test",
            created_by: "fCC",
            assigned_to: "",
            status_text: "",
          })
          .end(function(err, res) {
            issue2 = res.body;
            done();
          });
      });
  });

  suite("Routing Tests", function() {
    suite("3 Post request Tests", function() {
      test("Create an issue with every field: POST request to /api/issues/{project}", function(done) {
        chai.request(server)
          .post("/api/issues/testing123")
          .set("content-type", "application/json")
          .send({
            issue_title: "Issue 1",
            issue_text: "Functional Test",
            created_by: "fCC",
            assigned_to: "Sakhi",
            status_text: "Not Done",
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, "Issue 1");
            assert.equal(res.body.assigned_to, "Sakhi");
            assert.equal(res.body.created_by, "fCC");
            assert.equal(res.body.status_text, "Not Done");
            assert.equal(res.body.issue_text, "Functional Test");
            done();
          });
      }).timeout(10000);

      test("Create an issue with only required fields: POST request to /api/issues/{project}", function(done) {
        chai.request(server)
          .post("/api/issues/testing123")
          .set("content-type", "application/json")
          .send({
            issue_title: "Issue 2",
            issue_text: "Functional Test",
            created_by: "fCC",
            assigned_to: "",
            status_text: "",
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, "Issue 2");
            assert.equal(res.body.created_by, "fCC");
            assert.equal(res.body.issue_text, "Functional Test");
            assert.equal(res.body.assigned_to, "");
            assert.equal(res.body.status_text, "");
            done();
          });
      }).timeout(5000);

      test("Create an issue with missing required fields: POST request to /api/issues/{project}", function(done) {
        chai.request(server)
          .post("/api/issues/testing123")
          .set("content-type", "application/json")
          .send({
            issue_title: "",
            issue_text: "",
            created_by: "fCC",
            assigned_to: "",
            status_text: "",
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "required field(s) missing");
            done();
          });
      });
    });

    suite("3 Get request Tests", function() {
      test("View issues on a project: GET request to /api/issues/{project}", function(done) {
        chai.request(server)
          .get("/api/issues/testing123")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });

      test("View issues on a project with one filter: GET request to /api/issues/{project}", function(done) {
        chai.request(server)
          .get("/api/issues/testing123")
          .query({ _id: issue1._id })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].issue_title, issue1.issue_title);
            assert.equal(res.body[0].issue_text, issue1.issue_text);
            done();
          });
      });

      test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function(done) {
        chai.request(server)
          .get("/api/issues/testing123")
          .query({
            issue_title: issue1.issue_title,
            issue_text: issue1.issue_text,
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].issue_title, issue1.issue_title);
            assert.equal(res.body[0].issue_text, issue1.issue_text);
            done();
          });
      });
    });

    suite("5 Put request Tests", function() {
      test("Update one field on an issue: PUT request to /api/issues/test-data-put", function(done) {
        chai.request(server)
          .put("/api/issues/testing123")
          .send({
            _id: issue1._id,
            issue_title: "different",
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, issue1._id);
            done();
          });
      });

      test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function(done) {
        chai.request(server)
          .put("/api/issues/testing123")
          .send({
            _id: issue1._id,
            issue_title: "random",
            issue_text: "random",
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, issue1._id);
            done();
          });
      });

      test("Update an issue with missing _id: PUT request to /api/issues/{project}", function(done) {
        chai.request(server)
          .put("/api/issues/testing123")
          .send({
            issue_title: "update",
            issue_text: "update",
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });

      test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function(done) {
        chai.request(server)
          .put("/api/issues/testing123")
          .send({
            _id: issue1._id,
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "no update field(s) sent");
            assert.equal(res.body._id, issue1._id);
            done();
          });
      });

      test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function(done) {
        chai.request(server)
          .put("/api/issues/testing123")
          .send({
            _id: "668e657df323336a3586d5d2",
            issue_title: "update",
            issue_text: "update",
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not update issue");
            assert.equal(res.body._id, "668e657df323336a3586d5d2");
            done();
          });
      });
    });

    suite("3 DELETE request Tests", function() {
      test("Delete an issue: DELETE request to /api/issues/{project}", function(done) {
        chai.request(server)
          .delete("/api/issues/testing123")
          .send({ _id: issue1._id })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully deleted");
            assert.equal(res.body._id, issue1._id);
            done();
          });
      });

      test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function(done) {
        chai.request(server)
          .delete("/api/issues/testing123")
          .send({ _id: "668e657df323336a3586d5d2" })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not delete");
            assert.equal(res.body._id, "668e657df323336a3586d5d2");
            done();
          });
      });

      test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function(done) {
        chai.request(server)
          .delete("/api/issues/testing123")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });
    });
  });
});
