const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reservationSchema= new Schema({
  lawns: [
    {
      lawn: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
