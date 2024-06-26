const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const RequestsCar = require("../../models/ambulance/requestsCar");

mongoose.Promise = global.Promise;
const describeSate = new Schema({
  describePatient: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },

  requestID:{ type: mongoose.Schema.Types.ObjectId, ref: "RequestsCar", default: null }

  
});

module.exports = mongoose.model("DescribeSate", describeSate);
