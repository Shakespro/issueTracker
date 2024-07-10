// Import necessary modules and setup chai
const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server"); // Assuming your server file is named server.js

// Import Mongoose and your models
const mongoose = require('mongoose');
const { Issue, Project } = require("../models"); // Adjust the path as per your project structure

// Configure chai to use chai-http plugin
chai.use(chaiHttp);

// Define variables to store IDs for testing
let deleteID;
let projectID;

// MongoDB connection setup
before(function(done) {
  // MongoDB connection URI with username, password, and database name
  const dbURI = 'mongodb+srv://Shakes:7BlAXQt2ABhAmndd@cluster0.xhbwdjn.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

  // Connect to MongoDB using mongoose
  mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('MongoDB connected');
      done();
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      done(err); // Pass error to Mocha to indicate connection failure
    });
});

// Test data setup
beforeEach(async function() {
  // Create a new project for testing
  const project = new Project({ name: 'test-data-abc123' });
  await project.save();
  projectID = project._id;

  // Create a new issue for deletion test
  const issue = new Issue({
    projectID,
    issue_title: "Issue",
    issue_text: "Functional Test",
    created_by: "fCC",
    assigned_to: "Sakhi",
    status_text: "Not Done",
  });
  await issue.save();
  deleteID = issue._id;
});

// Functional tests using Mocha and Chai
describe("Functional Tests", function () {
  
  describe("POST /api/issues/{project}", function () {
    it("should create an issue with every field", function (done) {
      chai.request(server)
        .post(`/api/issues/${projectID}`)
        .set("content-type", "application/json")
        .send({
          issue_title: "Issue",
          issue_text: "Functional Test",
          created_by: "fCC",
          assigned_to: "Sakhi",
          status_text: "Not Done",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          deleteID = res.body._id;
          assert.equal(res.body.issue_title, "Issue");
          assert.equal(res.body.assigned_to, "Sakhi");
          assert.equal(res.body.created_by, "fCC");
          assert.equal(res.body.status_text, "Not Done");
          assert.equal(res.body.issue_text, "Functional Test");
          done();
        });
    });

    it("should create an issue with only required fields", function (done) {
      chai.request(server)
        .post(`/api/issues/${projectID}`)
        .set("content-type", "application/json")
        .send({
          issue_title: "Issue",
          issue_text: "Functional Test",
          created_by: "fCC",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Issue");
          assert.equal(res.body.created_by, "fCC");
          assert.equal(res.body.issue_text, "Functional Test");
          done();
        });
    });

    it("should return an error with missing required fields", function (done) {
      chai.request(server)
        .post(`/api/issues/${projectID}`)
        .set("content-type", "application/json")
        .send({
          issue_title: "",
          issue_text: "",
          created_by: "fCC",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });

  describe("GET /api/issues/{project}", function () {
    it("should view issues on a project", function (done) {
      chai.request(server)
        .get(`/api/issues/${projectID}`)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 1); // Adjust based on the actual number of issues in your test data
          done();
        });
    });

    it("should view issues on a project with one filter", function (done) {
      chai.request(server)
        .get(`/api/issues/${projectID}`)
        .query({
          _id: deleteID, // Use deleteID or adjust to match your test data
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body[0], {
            _id: deleteID,
            issue_title: "Issue",
            issue_text: "Functional Test",
            created_on: res.body[0].created_on, // Adjust based on actual response structure
            updated_on: res.body[0].updated_on, // Adjust based on actual response structure
            created_by: "fCC",
            assigned_to: "Sakhi",
            open: true, // Adjust based on actual response structure
            status_text: "Not Done",
          });
          done();
        });
    });
  });

  describe("PUT /api/issues/{project}", function () {
    it("should update one field on an issue", function (done) {
      chai.request(server)
        .put(`/api/issues/${projectID}`)
        .send({
          _id: deleteID, // Use deleteID or adjust to match your test data
          issue_title: "Updated Issue Title",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, deleteID);
          done();
        });
    });

    it("should update multiple fields on an issue", function (done) {
      chai.request(server)
        .put(`/api/issues/${projectID}`)
        .send({
          _id: deleteID, // Use deleteID or adjust to match your test data
          issue_title: "Updated Issue Title",
          issue_text: "Updated Issue Text",
          open: false,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, deleteID);
          done();
        });
    });

    it("should return an error with missing _id", function (done) {
      chai.request(server)
        .put(`/api/issues/${projectID}`)
        .send({
          issue_title: "Updated Issue Title",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    it("should return an error with no fields to update", function (done) {
      chai.request(server)
        .put(`/api/issues/${projectID}`)
        .send({
          _id: deleteID, // Use deleteID or adjust to match your test data
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, deleteID);
          done();
        });
    });

    it("should return an error with an invalid _id", function (done) {
      chai.request(server)
        .put(`/api/issues/${projectID}`)
        .send({
          _id: "invalid_id",
          issue_title: "Updated Issue Title",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, "invalid_id");
          done();
        });
    });
  });

  describe("DELETE /api/issues/{project}", function () {
    it("should delete an issue", function (done) {
      chai.request(server)
        .delete(`/api/issues/${projectID}`)
        .send({
          _id: deleteID, // Use deleteID or adjust to match your test data
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          assert.equal(res.body._id, deleteID);
          done();
        });
    });

    it("should return an error with an invalid _id", function (done) {
      chai.request(server)
        .delete(`/api/issues/${projectID}`)
        .send({
          _id: "invalid_id",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, "invalid_id");
          done();
        });
    });

    it("should return an error with missing _id", function (done) {
      chai.request(server)
        .delete(`/api/issues/${projectID}`)
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });

});

// Cleanup after all tests
after(async function() {
  // Clean up your test data or close connections if necessary
  await Issue.deleteMany({}); // Remove all test issues
  await Project.deleteMany({}); // Remove all test projects
  await mongoose.connection.close();
});
