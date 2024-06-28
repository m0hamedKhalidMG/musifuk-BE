// controllers/hospitalController.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Hospital = mongoose.model("Hospital");
const Owner = mongoose.model("Owner");

const PatientAssignment = mongoose.model("PatientAssignment");

exports.createHospital = async (req, res) => {
  try {
    const {
      name,
      address,
      location,
      departments,
      medicalEquipment,
      serumsAndVaccines,
      currentBedAvailability,
    } = req.body;

    const hospital = new Hospital({
      name,
      address,
      location,
      departments,
      medicalEquipment,
      serumsAndVaccines,
      currentBedAvailability,
    });

    await hospital.save();
    res.status(201).json(hospital);
  } catch (error) {
    console.error("Error creating hospital:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.addnewpatient = async (req, res) => {
  const {
    name,
    age,
    gender,
    condition,
    hospitalId,
    department,
    equipmentNeeded,
    serumsNeeded,
  } = req.body;

  try {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    const departmentIndex = hospital.departments.findIndex(
      (dep) => dep.name === department
    );
    if (departmentIndex === -1) {
      return res
        .status(404)
        .json({
          message: `Department '${department}' not found in the hospital`,
        });
    }

    const departmentInfo = hospital.departments[departmentIndex];
    if (departmentInfo.numberOfBeds <= 0) {
      return res
        .status(400)
        .json({ message: `No available beds in department '${department}'` });
    }

    departmentInfo.numberOfBeds -= 1;

    // if (serumsNeeded && serumsNeeded.length > 0) {
    //   serumsNeeded.forEach(serum => {
    //     const serumIndex = hospital.serumsAndVaccines.findIndex(s => s.name === serum);
    //     if (serumIndex !== -1) {
    //       hospital.serumsAndVaccines[serumIndex].quantity -= 1;
    //     }
    //   });
    // }
    await hospital.save();
    const patient = new PatientAssignment({
      name,
      age,
      gender,
      condition,
      hospital: hospital._id,
      department,
      equipmentNeeded,
      serumsNeeded,
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.registerowner = async (req, res) => {
  const { name, email, password, phone, hospital } = req.body;

  try {
    // Check if owner with the same email already exists
    let existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new owner
    const newOwner = new Owner({
      name,
      email,
      hospital,
      password: hashedPassword,
      contactInfo: {
        phone,
      },
    });

    // Save the owner to the database
    await newOwner.save();

    // Return success response
    res.status(201).json({ message: "Owner created successfully" });
  } catch (error) {
    console.error("Error registering owner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getOwnerHospitals = async (req, res) => {
  try {
    // Find the owner by ID and populate the hospitals array
    const owner = await Owner.findById(req.user._id).populate("hospital");

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Extract hospitals from the owner object
    const hospital = owner.hospital;

    res.json(hospital);
  } catch (error) {
    console.error("Error fetching owner hospitals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getPatients = async (req, res) => {
  try {
    const Patients = await PatientAssignment.find({
      hospital: req.user.hospital,
    });

    if (!Patients) {
      return res.status(404).json({ message: "Patients not found" });
    }

    res.json(Patients);
  } catch (error) {
    console.error("Error fetching Patients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateEquipment = async (req, res) => {
  const { name, quantity } = req.body;
  console.log(req.user);
  try {
    const hospital = await Hospital.findById(req.user.hospital);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    await hospital.updateMedicalEquipment(name, quantity);

    return res
      .status(200)
      .json({ message: "Medical equipment updated successfully", hospital });
  } catch (error) {
    console.error("Error updating medical equipment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateserumsAndVaccines = async (req, res) => {
  const { name, quantity } = req.body;
  try {
    const hospital = await Hospital.findById(req.user.hospital);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    await hospital.updateserumsAndVaccines(name, quantity);

    return res
      .status(200)
      .json({ message: "serumsAndVaccines updated successfully", hospital });
  } catch (error) {
    console.error("Error updatingserumsAndVaccines:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.updatedepartments = async (req, res) => {
  const { name, numberOfBeds } = req.body;
  try {
    const hospital = await Hospital.findById(req.user.hospital);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    await hospital.updatedepartment(name, numberOfBeds);

    return res
      .status(200)
      .json({ message: "departments updated successfully", hospital });
  } catch (error) {
    console.error("Error departments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

