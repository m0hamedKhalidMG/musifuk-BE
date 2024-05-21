const mongoose = require("mongoose");
const Driver = mongoose.model("Driver");
const AmbulanceCar = mongoose.model("AmbulanceCar");
const RequestsCar = mongoose.model("RequestsCar");

exports.getDriverDetails = async (req, res) => {
  const driver = await Driver.findById(req.user._id);

  if (!driver) {
    return res
      .status(404)
      .json({ success: false, message: "Driver not found" });
  }

  const cars = await AmbulanceCar.findOne({ assignedDriver: driver._id });

  res.json({ success: true, result: { driver, cars } });
};

exports.getRequestsByCar = async (req, res) => {
  const { carId } = req.params;

  try {
    const requests = await RequestsCar.find({ assignedCars: carId }).populate(
      "assignedCars"
    );

    if (!requests || requests.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No requests found for this car" });
    }

    res.json({ success: true, result: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.updateCarStatus = async (req, res) => {
  const { carId, status } = req.body;

  // Validate the status
  const validStatuses = ["available", "busy", "out of service"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    // Ensure the car is assigned to the driver
    const car = await AmbulanceCar.findOne({
      _id: carId,
      assignedDriver: req.user._id,
    });
    if (!car) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Car not found or not assigned to this driver",
        });
    }

    // Update the status
    car.status = status;
    await car.save();

    res.json({ success: true, message: "Car status updated", car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
