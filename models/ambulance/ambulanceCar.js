const mongoose = require("mongoose");
const Driver = require("../../models/ambulance/driver.js");
const ambulanceCarSchema = new mongoose.Schema({
  carNumber: { type: String, required: true },
  location: { type: String, required: true },

  status: {
    type: String,
    enum: ["available", "busy", "out of service"],
    default: "available",
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    default: null,
  },
  lastLocation: {
    timestamp: { type: Date, default: Date.now },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  deliveryStatus: {
    type: String,
    enum: ["pending", "delivered", "on progress","cancelled"],
    default: "not assgine",
  },
});
ambulanceCarSchema.index({ "lastLocation.coordinates": "2dsphere" });

module.exports = mongoose.model("AmbulanceCar", ambulanceCarSchema);
