const mongoose = require("mongoose");

const RequestsCar = mongoose.model("RequestsCar");
const AmbulanceCar = mongoose.model("AmbulanceCar");

exports.createAmbulanceRequest = async (req, res) => {
  const newRequest = await RequestsCar.create(req.body);
  res.status(201).json(newRequest);
};

exports.getAmbulanceRequests = async (req, res) => {
  const requests = await RequestsCar.find().populate("assignedCars");
  res.json(requests);
};
exports.deleteAmbulanceRequest = async (req, res) => {
  const { id } = req.params;

  const deletedRequest = await RequestsCar.findByIdAndDelete(id);
  if (!deletedRequest) {
    return res.status(404).json({ message: "Ambulance request not found" });
  }
  res.json({ message: "Ambulance request deleted successfully" });
};

exports.assignCarToRequest = async (req, res) => {
  const { requestId, carIds } = req.body;
  const cars = await AmbulanceCar.find({ _id: { $in: carIds } });

  if (cars.length !== carIds.length) {
    return res.status(400).json({ error: "One or more cars not found" });
  }
  const unavailableCars = cars.filter((car) => car.status !== "available");
  if (unavailableCars.length > 0) {
    return res
      .status(400)
      .json({ error: "One or more cars are not available" });
  }

  const updatedRequest = await RequestsCar.findByIdAndUpdate(
    requestId,
    { $push: { assignedCars: { $each: carIds } } },
    { new: true }
  ).populate("assignedCars");

  if (!updatedRequest) {
    return res.status(404).json({ error: "Ambulance request not found" });
  }

  await AmbulanceCar.updateMany(
    { _id: { $in: carIds } },
    { $set: { status: "busy", deliveryStatus: "on progress" } }
  );

  res.json(updatedRequest);
};

exports.markPatientsAsDelivered = async (req, res) => {
  const { requestId } = req.body;

  // Find the request by ID
  const request = await RequestsCar.findById(requestId).populate(
    "assignedCars"
  );

  if (!request) {
    return res.status(404).json({ error: "Ambulance request not found" });
  }

  const undeliveredCars = request.assignedCars.filter(
    (car) => car.deliveryStatus !== "delivered"
  );
  const allDelivered = undeliveredCars.length === 0;
  if (!allDelivered) {
    const undeliveredCarIds = undeliveredCars.map((car) => car._id);
    return res.status(400).json({
      error: "Not all cars have delivered the patients to the destination",
      undeliveredCarIds: undeliveredCarIds,
    });
  }

  if (!allDelivered) {
    return res.status(400).json({
      error: "Not all cars have delivered the patients to the destination",
    });
  }
  // Update the status of the assigned cars to "available"
  await AmbulanceCar.updateMany(
    { _id: { $in: request.assignedCars } },
    { $set: { status: "available", deliveryStatus: "not assgine" } }
  );

  // Mark the request as completed
  request.state = "deliverd";
  await request.save();

  res.json({ message: "Patients marked as delivered", request });
};
