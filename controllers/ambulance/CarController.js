const mongoose = require("mongoose");

const AmbulanceCar = mongoose.model("AmbulanceCar");
const RequestsCar = mongoose.model("RequestsCar");

exports.create = async (req, res) => {
  const newAmbulanceCar = new AmbulanceCar(req.body);
  const savedAmbulanceCar = await newAmbulanceCar.save();
  res.status(201).json(savedAmbulanceCar);
};

// Get all ambulance cars
exports.list = async (req, res) => {
    const ambulanceCars = await AmbulanceCar.find().populate({
      path: "assignedDriver",
      select: "-password" // Exclude the password field
    });

  res.json(ambulanceCars);
};

exports.get = async (req, res) => {
  const ambulanceCar = await AmbulanceCar.findById(req.params.id).populate(
    "assignedDriver"
  );
  if (!ambulanceCar) {
    return res.status(404).json({ message: "Ambulance car not found" });
  }
  res.json(ambulanceCar);
};

exports.update = async (req, res) => {
  const updatedAmbulanceCar = await AmbulanceCar.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!updatedAmbulanceCar) {
    return res.status(404).json({ message: "Ambulance car not found" });
  }
  res.json(updatedAmbulanceCar);
};

exports.delete = async (req, res) => {
  const deletedAmbulanceCar = await AmbulanceCar.findByIdAndDelete(
    req.params.id
  );
  if (!deletedAmbulanceCar) {
    return res.status(404).json({ message: "Ambulance car not found" });
  }
  res.json({ message: "Ambulance car deleted successfully" });
};
exports.updateCoordinates = async (req, res) => {
  const { carNumber, newCoordinates } = req.body;

  const updatedCar = await AmbulanceCar.findOneAndUpdate(
    { carNumber: carNumber },
    {
      $set: {
        "lastLocation.coordinates.coordinates": newCoordinates,
      },
    },
    { new: true }
  );
  if (!updatedCar) {
    return res.status(404).json({ message: "Ambulance car not found" });
  }
  return res.json(updatedCar);
};

exports.getNearestAvailableCars = async (req, res) => {
  const requestId = req.query.requestId;
  if (!requestId) {
    return res.status(400).json({ message: "Request ID is required" });
  }

  try {
    // Find the request by ID
    const request = await RequestsCar.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const pickupLocation = request.pickupLocation.coordinates;

    // Find all available ambulance cars sorted by their distance to the pickup location
    const availableCars = await AmbulanceCar.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: pickupLocation.coordinates,
          },
          distanceField: "distance",
          spherical: true,
          query: { status: "available" },
        },
      },
      { $sort: { distance: 1 } }, // Sort by distance in ascending order
    ]);

    if (availableCars.length === 0) {
      return res
        .status(404)
        .json({ message: "No available ambulance cars found nearby" });
    }

    res.status(200).json(availableCars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
