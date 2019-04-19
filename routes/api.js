const express = require('express');
const router = express.Router();
const settings = require('../config/settings');
const controller = require('../controllers/Apicontroller');
const users = require('../database/schemas/users');
const booking = require('../database/schemas/booking');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.get('/', function (req, res, next) {
    res.send(`This is response for ${req.url}`);
});

/*router.route('/users')
    .get((req, res, next) => {
        req.conent = 'Welcome to Users API';
        next();
    },(req, res) => {
        const conent = req.conent || '';
        res.send(conent);
    });*/

router.get('/findUserById/:userId', (req, res) => {
    const userId = req.params.userId;
    /*users.findById(userId, {age: 1, isActive:1, _id:0}, (error, user) => {
        if(error) throw new Error(error);
        res.json(user);
    });*/
    users.findOne({ "_id": ObjectId(userId) }, { isActive: 0, _id: 0, __v: 0 }, (err, data) => {
        if (err) throw new Error(err);
        res.json(data);
    });
});

router.delete('/deleteUserById/:userId', (req, res) => {
    const userId = req.params.userId;
    /*users.findByIdAndDelete(userId, (err, data) => {
        if(err) throw new Error(err);
        res.json(data);
    });*/
    users.findOne({ "_id": ObjectId(userId) }, { isActive: 0, __v: 0 }, (err, data) => {
        if (err) throw new Error(err);
        if (data && data._id) {
            users.remove({ _id: ObjectId(userId) }, (error, result) => {
                res.json(data);
            })
        } else {
            res.json(err);
        }
    });
});

router.put('/findAndUpdateUser/:userId/:username?', (req, res) => {
    const userId = req.params.userId;
    const username = req.params.username || '';
    const body = req.body;
    if (body.hasOwnProperty('isActive')) {
        const updateObj = {
            isActive: body.isActive
        };
        const match = {};
        if (username) {
            match['username'] = username;
        } else {
            match["_id"] = userId;
        }
        /*users.findOneAndUpdate(match, {"$set": updateObj}, (err, data) => {
            if(err) throw new Error(err);
            res.json(data);
        })*/
        users.findOneAndUpdate(match, updateObj, { new: true }, (err, data) => {
            if (err) throw new Error(err);
            res.json(data);
        })
    }
})

router.get('/findUsersByAge', (req, res) => {
    // https://docs.mongodb.com/manual/reference/operator/query/in/
    /*users.find({age: {"$exists": true,"$gt": 20}}, (err, data) => {
        if(err) throw new Error(err);
        res.json(data);
    });*/

    users.find({ age: { "$exists": true, "$in": [15, 20, 50] } }, (err, data) => {
        if (err) throw new Error(err);
        res.json(data);
    });
});

router.get('/sumOfActiveUsersAge', (req, res) => {
    // https://docs.mongodb.com/manual/reference/operator/aggregation/sum/
    users.aggregate([
        {
            "$match": { "age": { "$gte": 20 } }
        },
        {
            "$group": {
                _id: "$isActive",
                nameList: { "$push": "$name" },
                count: { "$sum": "$age" }
            }
        },
        {
            "$sort": { "count": 1 }
        },
        {
            "$project": {
                _id: 0
            }
        }
    ], (err, data) => {
        if (err) throw new Error(err);
        res.json(data);
    })
})

router.post('/save-booking', (request, response) => {
    const document = request.body;
    booking.insertMany(document, (err, bookingsList) => {
        if (err) throw new Error(err);
        response.json(bookingsList);
    });
});

router.get('/fetch-booking', (request, response, next) => {
    booking.find({}, null, { lean: true }, (err, docs) => {
        if (err) throw new Error(err);
        request.mongoObj = docs;
        next();
    })
}, (req, res) => {
    let allBooking = req.mongoObj;
    allBooking = allBooking.map(adhoc => {
        delete adhoc.__v;
        return adhoc;
    })
    res.json(allBooking);
});

router.get("/findUserDetailsWithBooking", (req, res) => {
    booking.aggregate([
        {
            "$match": {}
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "userId",
                "foreignField": "_id",
                "as": "userDetails"
            }
        },{
            "$unwind": "$userDetails"
        }, {
            "$addFields": {
                user: {
                    "name": "$userDetails.name",
                    "age": "$userDetails.age",
                    "username": "$userDetails.username",
                }
            }
        },{
            "$group": {
                "_id": "$userId",
                "bookingList": {"$push": "$bookedFor"},
                "user": {"$first": "$user"}
            }
        }, {
            "$project": {
                "userDetails": 0,
                "__v":0
            }
        }
    ], (err, data) => {
        if (err) throw new Error(err);
        res.json(data);
    })
})

router.route('/users/:userId?')
    .get((req, res, next) => {
        const userId = req.params.userId || '';
        const nameFromQuery = req.query && req.query['name'] || '';
        const url = `${settings.placeholderURL}/users/${userId}`;

        controller.fetchUsers(url)
            .then(successResponse => {
                req.placeholderData = successResponse;
                next();
            })
            .catch(erroResponse => res.send(erroResponse))

    }, controller.formatData.bind(controller), controller.sendResponse)
    .post((req, res, next) => {
        const body = req.body || {};
        const url = `${settings.placeholderURL}/users`;
        controller.saveUser(url, body)
            .then(successResponse => {
                res.json(successResponse);
            })
            .catch(erroResponse => res.status(403).send(erroResponse))
    })

function sendResponse(req, res) {
    res.json(req.placeholderUsers);
}
function formatUserObject(req, res, next) {
    const userRespose = req.placeholderUsers || '';
    req.placeholderUsers = userRespose && userRespose.map(adhoc => {
        return {
            id: adhoc.id,
            name: adhoc.name,
            username: adhoc.username,
            email: adhoc.email
        }
    }) || []
    next();
}

module.exports = router;