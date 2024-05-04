const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    departments: [{
      name: { type: String, required: true },
      numberOfBeds: { type: Number, required: true }
      // You can add more department details here
    }],
    medicalEquipment: [String], // Assuming medical equipment names are stored as strings
    serumsAndVaccines: [String], // Assuming serum and vaccine names are stored as strings
    currentBedAvailability: { type: Number, required: true },
    numberOfEmergencyBeds: { type: Number, required: true } 
  });
  
  // Create Hospital model
  module.exports = mongoose.model('Hospital', hospitalSchema);
