const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Hospital = require("../../models/hospital/Hospitals");
const RequestsCar = require("../../models/ambulance/requestsCar");

const patientAssignmentSchema = new Schema({

  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  condition: { type: String, required: true }, // Description of the patient's condition
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }, // Reference to the hospital
  department: { type: String, required: true }, // Name of the department
  equipmentNeeded: [{ type: String }], // List of equipment needed
  serumsNeeded: [{ type: String }], // List of serums needed
  assignedAt: { type: Date, default: Date.now }, // Timestamp for when the 


  
});

module.exports = mongoose.model("PatientAssignment", patientAssignmentSchema);