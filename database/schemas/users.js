const mongoose = require('mongoose');
const user_schmea = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: false,
        default: 10
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    }
});

module.exports = mongoose.model('users', user_schmea);

