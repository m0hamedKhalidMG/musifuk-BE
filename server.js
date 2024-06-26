const mongoose = require("mongoose");

require("dotenv").config({ path: ".env" });
require('./models/ambulance/driver.js'); 
require('./models/ambulance/ambulanceCar.js'); 
require('./models/ambulance/requestsCar.js'); 
require('./models/ambulance/describleState.js'); 
require('./models/hospital/Owner.js'); 
require('./models/hospital/Hospitals.js'); 
require('./models/hospital/patientAssignment.js'); 

// Connect to our Database and handle any bad connections
// mongoose.connect(process.env.DATABASE);

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on("error", (err) => {
  console.error(`🚫 Error → : ${err.message}`);
});

const glob = require("glob");
const path = require("path");

 glob.sync("./models/**/*.js").forEach(function (file) {
   require(path.resolve(file));
 });

// Start our app!
const { app, server } = require("./app");

app.set("port", process.env.PORT || 80);
server.listen(app.get("port"), () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});

