const Pusher = require("pusher");
const mongoose = require("mongoose");
const AmbulanceCar = mongoose.model("AmbulanceCar");
const RequestsCar = mongoose.model("RequestsCar");

let pusher;

function initializePusher() {
  pusher = new Pusher({
    appId: "1826287",
    key: "ea80cde6e77453dc1bf5",
    secret: "c60a75a7c8986c98f0a5",
    cluster: "mt1",
    useTLS: true,
  });

  return pusher;
}

async function assignCarToRequest(req, res) {
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
    {
      $push: { assignedCars: { $each: carIds } },
      $set: { state: "in progress" }
    },
    { new: true }
  ).populate("assignedCars");

  if (!updatedRequest) {
    return res.status(404).json({ error: "Ambulance request not found" });
  }

  await AmbulanceCar.updateMany(
    { _id: { $in: carIds } },
    { $set: { status: "busy", deliveryStatus: "on progress" } }
  );

  carIds.forEach((carId) => {
    pusher.trigger(`car_${carId}`, "newassignment", {
      message: "You have a new assignment",
      request: updatedRequest,
    });
  });

  res.json(updatedRequest);
}

async function updatePosition(req, res) {
  try {
    if (!req.user || !req.user._id) {
      throw new Error("User not authenticated or missing user ID");
    }

    const ambulanceCar = await AmbulanceCar.findOne({
      assignedDriver: req.user._id,
    });

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

    const carNumber = ambulanceCar.carNumber;
    pusher.trigger(`car_${carNumber}`, "positionUpdated", {
      message: "Position updated",
      coordinates: newCoordinates,
    });

    return res.json({ message: "last location updated successfully" });
  } catch (error) {
    console.error("Error updating last location:", error);
    throw error;
  }
}
async function createAmbulanceRequest  (req, res)  {
  try {
    const newRequest = await RequestsCar.create(req.body);

    pusher.trigger("newRequestCar-channel", "newRequestCar", newRequest); // Emit event using Pusher

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating ambulance request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  initializePusher,
  updatePosition,
  assignCarToRequest,
  createAmbulanceRequest
};
