const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Hospital = require("../../models/hospital/Hospitals");
const RequestsCar = require("../../models/ambulance/requestsCar");

const patientAssignmentSchema = new Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "RequestsCar", required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  department: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PatientAssignment", patientAssignmentSchema);