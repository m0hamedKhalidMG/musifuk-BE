// models/owner.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Hospital = require("../../models/hospital/Hospitals");

const ownerSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactInfo: {
      phone: { type: String, required: true },
    }
   ,
    isLoggedIn: {
        type: Boolean,
      },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    createdAt: { type: Date, default: Date.now },
  });
  
module.exports = mongoose.model('Owner', ownerSchema);
