const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const driverSchema = new Schema({
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role :  { type: String, required: true },
    isLoggedIn: {
        type: Boolean,
      },

});

module.exports = mongoose.model("Driver", driverSchema);
