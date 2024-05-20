const mongoose = require("mongoose");

const Driver = mongoose.model('Driver');
const bcrypt = require("bcryptjs");

// Create a new driver
exports.create = async (req, res) => {
    const { name, licenseNumber, contactNumber, email, password,role } = req.body;
    let existingDriver = await Driver.findOne({ email });

    if (existingDriver) {
        return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDriver = new Driver({
        name,
        licenseNumber,
        contactNumber,
        email,
        password: hashedPassword,
        role
    });
    await newDriver.save();
    res.status(201).json({ message: 'Driver created successfully' });

        
   
};
// Get all drivers
exports.list = async (req, res) => {
   
        const drivers = await Driver.find();
        res.json(drivers);
    } 


// Get a single driver by ID
exports.get = async (req, res) => {

        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
       
        res.json(driver);
        }
};

// Update a driver by ID
exports.update = async (req, res) => {
   
        const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDriver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(updatedDriver);
   
};
// Delete a driver by ID
exports.delete = async (req, res) => {
   
    const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
    if (!deletedDriver) {
        return res.status(404).json({ message: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted successfully' });

};
