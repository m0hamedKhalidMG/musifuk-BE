// controllers/hospitalController.js
const mongoose = require("mongoose");

const Hospital = mongoose.model("Hospital");

exports.createHospital = async (req, res) => {
  const {
    name,
    departments,
    address,
    coordinates,
    medicalEquipment,
    serumsAndVaccines,
    currentBedAvailability
  } = req.body;

  try {
    const newHospital = new Hospital({
      name,
      departments,
      address,
   
      location: {
        type: 'Point',
        coordinates
      },
      medicalEquipment,
      serumsAndVaccines,
 
    });

    const savedHospital = await newHospital.save();
    res.status(201).json(savedHospital);
  } catch (error) {
    console.error('Error creating hospital:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
