const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  departments: [
    {
      name: { type: String, required: true },
      numberOfBeds: { type: Number, required: true },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  address: { type: String, required: true },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  medicalEquipment: [ {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },],
  serumsAndVaccines: [ {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },],
});
hospitalSchema.index({ location: "2dsphere" }); // Create a geospatial index
// Method to update medicalEquipment by name
hospitalSchema.methods.updateMedicalEquipment = async function (name, quantity) {
  try {
    const hospital = this;
    const medicalEquipmentItem = hospital.medicalEquipment.find(item => item.name === name);

    if (medicalEquipmentItem) {
      medicalEquipmentItem.quantity = quantity;
    } else {
      hospital.medicalEquipment.push({ name, quantity });
    }

    await hospital.save();
    return hospital;
  } catch (error) {
    throw error;
  }
};
hospitalSchema.methods.updateserumsAndVaccines = async function (name, quantity) {
  try {
    const hospital = this;
    const serumsAndVaccinesitems = hospital.serumsAndVaccines.find(item => item.name === name);

    if (serumsAndVaccinesitems) {
      serumsAndVaccinesitems.quantity = quantity;
    } else {
      hospital.serumsAndVaccines.push({ name, quantity });
    }

    await hospital.save();
    return hospital;
  } catch (error) {
    throw error;
  }
};
hospitalSchema.methods.updatedepartment = async function (name, numberOfBeds) {
  try {
    const hospital = this;
    const Departmentitems = hospital.departments.find(item => item.name === name);

    if (Departmentitems) {
      Departmentitems.numberOfBeds = numberOfBeds;
    } else {
      hospital.departments.push({ name, numberOfBeds });
    }

    await hospital.save();
    return hospital;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("Hospital", hospitalSchema);
