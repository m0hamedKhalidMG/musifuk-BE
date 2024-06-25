const xx={

    "email": "john.doe@example.com",
  "password": "password123",
    "role" :"Owner"
}
const mongoose = require("mongoose");

const socketIo = require('socket.io');
const AmbulanceCar = mongoose.model("AmbulanceCar");

let io;

function initializeSocketServer(server) {
  io = socketIo(server, {
    cors: {
      origin: '*', // Adjust this to your client's origin if needed
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {

    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });
    socket.on('updatePosition', async ({ carNumber, newCoordinates }) => {
      try {
        const updatedCar = await AmbulanceCar.findOneAndUpdate(
          { carNumber: carNumber },
          { $set: { "lastLocation.coordinates.coordinates": newCoordinates } },
          { new: true }
        );

        if (updatedCar) {

          io.to(`car_${carNumber}`).emit('positionUpdated', { message: 'Position updated',  coordinates: newCoordinates });
        } else {
          socket.emit('error', { message: 'Ambulance car not found' });
        }
      } catch (error) {
        console.error(error);
        socket.emit('error', { message: 'Internal server error' });
      }
    });
  
  return io;
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
}

module.exports = {
  initializeSocketServer,
  getIo,
};
