const mongoose = require("mongoose");

const AmbulanceCar = mongoose.model("AmbulanceCar");

exports.create = async (req, res) => {
  const newAmbulanceCar = new AmbulanceCar(req.body);
  const savedAmbulanceCar = await newAmbulanceCar.save();
  res.status(201).json(savedAmbulanceCar);
};

// Get all ambulance cars
exports.list = async (req, res) => {
  const ambulanceCars = await AmbulanceCar.find().populate("assignedDriver");
  res.json(ambulanceCars);
};

exports.get = async (req, res) => {
  const ambulanceCar = await AmbulanceCar.findById(req.params.id).populate("assignedDriver");
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
