const mongoose = require('mongoose');

// Define the schema for the train model
const trainSchema = new mongoose.Schema({
  trainName: { type: String, required: true },
  trainNo: { type: String, required: true },
  fromStation: { type: String, required: true },
  toStation: { type: String, required: true },
  time: { type: String, required: true }, // Store time in HH:mm format
  seats: { type: Number, required: true },
  fare: { type: Number, required: true },
  date: { type: Date, required: true }, // Store date of journey
});

// Create the Train model using the schema
const Train = mongoose.model('Train', trainSchema);

module.exports = Train;
