const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Train = require('./models/trainSchema');
const SeatMap = require('./models/seatMap'); // New

dotenv.config();

const mongoURI = process.env.MONGODB_URI;
console.log('Mongo URI:', mongoURI);

const trains = [
  {
    trainName: 'Express 101',
    trainNo: 'EX101',
    fromStation: 'New York',
    toStation: 'Boston',
    time: '08:00',
    seats: 200,
    fare: 50,
    date: new Date('2025-03-25'),
  },
  {
    trainName: 'Express 102',
    trainNo: 'EX102',
    fromStation: 'New York',
    toStation: 'Boston',
    time: '10:00',
    seats: 150,
    fare: 60,
    date: new Date('2025-03-25'),
  },
  {
    trainName: 'Vaigai Express',
    trainNo: '11051',
    fromStation: 'Ramnad',
    toStation: 'Chennai',
    time: '09:30',
    seats: 200,
    fare: 50,
    date: new Date('2025-03-25'),
  },
  {
    trainName: 'Superfast 202',
    trainNo: 'SF202',
    fromStation: 'Chicago',
    toStation: 'Los Angeles',
    time: '14:30',
    seats: 150,
    fare: 80,
    date: new Date('2025-03-25'),
  },
];

const createSeatMap = (trainNo, date, seatCount) => {
  const seats = [];
  for (let i = 1; i <= seatCount; i++) {
    seats.push({ seatNumber: `S${i}`, isBooked: false });
  }
  return {
    trainNo,
    date,
    seats
  };
};

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');

    await Train.deleteMany({});
    await SeatMap.deleteMany({});

    await Train.insertMany(trains);
    console.log('✅ Trains inserted');

    const seatMaps = trains.map(train =>
      createSeatMap(train.trainNo, train.date, train.seats)
    );

    await SeatMap.insertMany(seatMaps);
    console.log('✅ Seat maps created for each train');

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error occurred:', err);
    mongoose.connection.close();
  });
