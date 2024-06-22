const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  departments: [
    {
      name: { type: String, required: true },
      numberOfBeds: { type: Number, required: true },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  address: { type: String, required: true },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  medicalEquipment: [ {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },],
  serumsAndVaccines: [ {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },],
});
hospitalSchema.index({ location: "2dsphere" }); // Create a geospatial index

// Create Hospital model
module.exports = mongoose.model("Hospital", hospitalSchema);
