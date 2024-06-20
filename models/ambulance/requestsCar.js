const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AmbulanceCar = require('../../models/ambulance/ambulanceCar.js');
const Hospital = require('../../models/hospital/Hospitals.js');

mongoose.Promise = global.Promise;
const requestsCar  = new Schema({
    patientName: { type: String, required: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    contactNumber: { type: String, required: true },
    nationalid: { type: String, required: true },
    email: { type: String, required: true },
    urgencyLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    state: { type: String, enum: ['deliverd', 'label created', 'cancelled','in progress'], default: 'label created' },
    pickupLocation: { type: String, required: true },
    destination: { type: String, default: 'Not determined' },
    description: { type: String ,required: true}, 
    additionalCosts: { type: Number, default: 0 },
    Numberofpatients : { type: Number, default: 1 },
    assignedCars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AmbulanceCar', default: null }],
    assignedHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },


});

module.exports = mongoose.model("RequestsCar", requestsCar);
