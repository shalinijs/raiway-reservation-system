const bookingSchema = new mongoose.Schema({
    trainName: String,
    trainNo: String,
    fromStation: String,
    toStation: String,
    time: String,
    passengers: [
      {
        name: String,
        age: Number,
        gender: String,
        classType: String,
        category: String,
        seat: String,
        fare: Number,
      }
    ],
    totalFare: Number,
    bookingDate: {
      type: Date,
      default: Date.now,
    }
  });
  