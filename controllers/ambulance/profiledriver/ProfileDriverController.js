const mongoose = require("mongoose");
const Driver = mongoose.model("Driver");
const AmbulanceCar = mongoose.model("AmbulanceCar");
const RequestsCar = mongoose.model("RequestsCar");
const DescribeSate = mongoose.model("DescribeSate");

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
      return res.status(404).json({
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
exports.updatedeliverystatus = async (req, res) => {
  const { requestId, carId } = req.params;
  const { newStatus } = req.body;

  try {
    // Find the request by ID
    const request = await RequestsCar.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Find the car by ID within the assigned cars array
    const car = request.assignedCars.find(
      (car) => car._id.toString() === carId
    );

    if (!car) {
      return res.status(404).json({ message: "Car not found in the request" });
    }

    // Update the deliveryStatus
    car.deliveryStatus = newStatus;

    // Save the updated request
    await request.save();
    const ambulanceCar = await AmbulanceCar.findById(carId);

    if (ambulanceCar) {
      ambulanceCar.deliveryStatus = newStatus;
      await ambulanceCar.save();
    } else {
      return res
        .status(404)
        .json({ message: "Car not found in the AmbulanceCar collection" });
    }
    res.json({ message: "Delivery status updated successfully", request });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}; //carId, newCoordinates, newTimestamp
exports.updateLastLocation = async (req, res) => {
try {

    if (!req.user || !req.user._id) {
      throw new Error("User not authenticated or missing user ID");
    }

    const ambulanceCar = await AmbulanceCar.findOne({ assignedDriver: req.user._id });

    if (!ambulanceCar) {
      throw new Error("Car not found in the AmbulanceCar collection");
    }
    const { newCoordinates, newTimestamp } = req.body;
    if (
      !Array.isArray(newCoordinates) ||
      newCoordinates.length !== 2 ||
      !newCoordinates.every(Number.isFinite)
    ) {
      throw new Error("newCoordinates must be an array of two numbers");
    }
    ambulanceCar.lastLocation.coordinates.coordinates = newCoordinates;
    ambulanceCar.lastLocation.timestamp = newTimestamp;

    await ambulanceCar.save();

    return res.json({ message: "last location updated successfully" });
  } catch (error) {
    console.error("Error updating last location:", error);
    throw error;
  }
};
exports.createDescribeSate = async (req, res) => {
  const { describePatient, requestID } = req.body;

  try {
      // Validate requestID
      if (requestID) {
          const request = await RequestsCar.findById(requestID);
          if (!request) {
              return res.status(404).json({ message: 'Request not found' });
          }
      }

      // Create the DescribeSate entry
      const newDescribeSate = new DescribeSate({
          describePatient,
          requestID
      });

      await newDescribeSate.save();
      res.status(201).json({ message: 'DescribeSate created successfully', newDescribeSate });
  } catch (error) {
      console.error('Error creating DescribeSate:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};
