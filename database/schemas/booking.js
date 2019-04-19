const mongoose = require('mongoose');
const booking_schmea = mongoose.Schema({
    bookedFor: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: false,
        default: 0
    }
});


module.exports = mongoose.model('booking', booking_schmea);

