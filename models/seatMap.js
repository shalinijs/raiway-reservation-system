// models/seatMap.js
const mongoose = require('mongoose');

const seatMapSchema = new mongoose.Schema({
  trainNo: { type: String, required: true },
  date: { type: Date, required: true },
  seats: [
    {
      seatNumber: String,
      isBooked: { type: Boolean, default: false },
    }
  ]
});

module.exports = mongoose.model('SeatMap', seatMapSchema);
