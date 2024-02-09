const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  user_name: { type: String, required: true },
  balance: { type: Number, required: true },
});

const User = mongoose.model('User', userSchema);


const stationSchema = new mongoose.Schema({
  station_id: { type: Number, required: true },
  station_name: { type: String, required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
});

const Station = mongoose.model('Station', stationSchema);

const trainSchema = new mongoose.Schema({
  train_id: { type: Number, required: true },
  train_name: { type: String, required: true },
  capacity: { type: Number, required: true },
  stops: [
    {
      station_id: { type: Number, required: true },
      arrival_time: { type: String },
      departure_time: { type: String },
      fare: { type: Number },
    },
  ],
  service_start: { type: String },
  service_ends: { type: String },
  num_stations: { type: Number },
});

const ticketSchema = new mongoose.Schema({
  ticket_id: { type: Number, required: true },
  wallet_id: { type: Number, required: true },
  route: [{ type: Number, required: true }],
});

const Ticket = mongoose.model('Ticket', ticketSchema);

const Train = mongoose.model('Train', trainSchema);

module.exports = {
  User,
  Station,
  Train,
  Ticket
};