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
    },
    optionalParam: {
        type: String,
        required: false
    }
});

/*{
    type: mongoose.Types.ObjectId,
    required: false
}*/

module.exports = mongoose.model('users', user_schmea);

