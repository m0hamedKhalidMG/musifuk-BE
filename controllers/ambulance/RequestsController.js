const mongoose = require("mongoose");
const PatientAssignment = mongoose.model("PatientAssignment");

const RequestsCar = mongoose.model("RequestsCar");
const AmbulanceCar = mongoose.model("AmbulanceCar");
const DescribeSate = mongoose.model("DescribeSate");
const Hospital = mongoose.model("Hospital");
const {  getIo } = require("../../socketServer");

exports.createAmbulanceRequest = async (req, res) => {
  const newRequest = await RequestsCar.create(req.body);
  const io = getIo();

  io.emit('newRequestCar', newRequest); // Emit event to all connected clients

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

  const io = getIo();

  carIds.forEach((carId) => {
    const room = `car_${carId}`;
    io.to(room).emit("newassignment", {
      message: "You have a new assignment",
      request: updatedRequest,
    });
  });
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
exports.getAllDescribeSate = async (req, res) => {
  try {
    const describeSates = await DescribeSate.find().populate("requestID");
    res.status(200).json(describeSates);
  } catch (error) {
    console.error("Error getting DescribeSate entries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getDescribeSateById = async (req, res) => {
  const { id } = req.params;

  try {
    const describeSate = await DescribeSate.findById(id).populate("requestID");
    if (!describeSate) {
      return res.status(404).json({ message: "DescribeSate not found" });
    }
    res.status(200).json(describeSate);
  } catch (error) {
    console.error("Error getting DescribeSate entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.assignHospital = async (req, res) => {
  const { requestId, hospitalId } = req.params;

  try {
    const request = await RequestsCar.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Assign the hospital to the request
    request.assignedHospital = hospitalId;

    await request.save();

    res.json({ message: "Hospital assigned successfully", request });
  } catch (error) {
    console.error("Error assigning hospital:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.filterHospitals = async (req, res) => {
  const { pickupLocation, departments, medicalEquipment, serumsAndVaccines } = req.body;

  try {
    // Define initial query based on provided filters
    let query = {};

    if (departments && departments.length > 0) {
      
      query["departments"] = {
        $all: departments.map((dept) => ({
          $elemMatch: {
            name: dept.name,
            available: { $gte: dept.minBeds },
          },
        })),
      };
    }

    if (medicalEquipment && medicalEquipment.length > 0) {
      query["medicalEquipment.name"] = { $all: medicalEquipment };
      query["medicalEquipment.quantity"] = { $gt: 0 };
    }

    if (serumsAndVaccines && serumsAndVaccines.length > 0) {
      query["serumsAndVaccines.name"] = { $all: serumsAndVaccines };
      query["serumsAndVaccines.quantity"] = { $gt: 0 };
    }

    // Apply $geoNear aggregation for geospatial query as the first stage
    const hospitals = await Hospital.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: pickupLocation,
          },
          distanceField: "distance",
          spherical: true,
        },
      },
      {
        $match: query, // Apply initial filtering based on provided criteria
      },
      { $sort: { distance: 1 } }, // Sort by distance in ascending order
    ]);

    res.json(hospitals);
  } catch (error) {
    console.error("Error filtering hospitals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.assignHospitalToPatient = async (req, res) => {
  const { patientId, hospitalId, department, minBeds } = req.body;

  try {
    // Find the hospital by ID
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Find the department in the hospital
    const dept = hospital.departments.find((dept) => dept.name === department);

    if (!dept) {
      return res
        .status(404)
        .json({ message: "Department not found in the hospital" });
    }

    // Check if there are available beds
    if (dept.numberOfBeds < minBeds) {
      return res
        .status(400)
        .json({ message: "No available beds in the specified department" });
    }

    // Decrease the number of available beds
    dept.numberOfBeds -= minBeds;

    // Save the updated hospital
    await hospital.save();

    // Create a patient assignment
    const assignment = new PatientAssignment({
      patientId,
      hospitalId,
      department,
    });

    // Save the patient assignment
    await assignment.save();

    res.json({
      message: "Hospital assigned to patient successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error assigning hospital to patient:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getAllRequestsByAssignedCar = async (req, res) => {
 
    try {

      if (!req.user || !req.user._id) {
        throw new Error("User not authenticated or missing user ID");
      }
  
      const ambulanceCar = await AmbulanceCar.findOne({ assignedDriver: req.user._id });
      const requests = await RequestsCar.find({
        assignedCars: { $in: [ambulanceCar._id] },
        state: "label created"
      })
      .populate('assignedCars')
      .populate('assignedHospital');
    if (requests.length === 0) {
      return res.status(404).json({ message: "No requests found for the assigned car" });
    }

    return res.json(requests);
  } catch (error) {
    console.error("Error retrieving requests:", error);
    return res.status(500).json({ error: error.message });
  }
};