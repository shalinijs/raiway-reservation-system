const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/railway_reservation', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// USER SCHEMA
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
const User = mongoose.model('User', userSchema);

// TRAIN SCHEMA
const trainSchema = new mongoose.Schema({
    trainName: String,
    trainNo: String,
    fromStation: String,
    toStation: String,
    time: String,
    seats: Number,
    fare: Number,
    date: Date,
});
const Train = mongoose.model('Train', trainSchema);

// BOOKING SCHEMA
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
const Booking = mongoose.model('Booking', bookingSchema);

// ✅ TICKET SCHEMA (new collection)
const ticketSchema = new mongoose.Schema({
    pnr: String,
    ticketId: String,
    trainNo: String,
    trainName: String,
    fromStation: String,
    toStation: String,
    journeyDate: String,
    passengers: [
        {
            name: String,
            age: Number,
            gender: String,
            classType: String,
            category: String,
            seat: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Ticket = mongoose.model('Ticket', ticketSchema);

// ROUTES

// User signup
app.post('/signup', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: 'User exists' });

        const user = new User({ email, username, password });
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ message: 'Signup error', error: err });
    }
});

// User login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ message: 'Login error', error: err });
    }
});

// Train search
app.get('/search-trains', async (req, res) => {
    const { from, to, date } = req.query;
    const searchDate = new Date(date);
    const start = new Date(searchDate.setHours(0, 0, 0, 0));
    const end = new Date(searchDate.setHours(23, 59, 59, 999));
    const trains = await Train.find({
        fromStation: from,
        toStation: to,
        date: { $gte: start, $lte: end },
    });
    res.status(200).json(trains);
});

// Booking endpoints
app.post('/book', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        const saved = await booking.save();
        res.status(201).json({ bookingId: saved._id });
    } catch (err) {
        res.status(500).json({ message: "Booking failed", error: err });
    }
});

app.get('/booking/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ message: "Booking not found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching booking", error: err });
    }
});

// ✅ NEW: Save ticket to database
app.post('/api/tickets', async (req, res) => {
    try {
        const ticket = new Ticket(req.body);
        const saved = await ticket.save();
        res.status(201).json({ message: 'Ticket saved', ticketId: saved._id });
    } catch (err) {
        res.status(500).json({ message: 'Error saving ticket', error: err });
    }
});

app.listen(PORT, () => {
    console.log(`🚆 Server running at http://localhost:${PORT}`);
});
// Validate ticket by PNR and Ticket ID
app.get('/api/tickets/validate', async (req, res) => {
    const { pnr, ticketId } = req.query;
    const ticket = await Ticket.findOne({ pnr, ticketId });
    if (ticket) {
        res.json(ticket);
    } else {
        res.status(404).json({ message: 'Ticket not found' });
    }
});

// Delete ticket by ID
app.delete('/api/tickets/:id', async (req, res) => {
    try {
        const deleted = await Ticket.findByIdAndDelete(req.params.id);
        if (deleted) {
            res.json({ message: 'Ticket deleted successfully' });
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});


