const express = require('express');
const router = express.Router();
const settings = require('../config/settings');
const controller = require('../controllers/Apicontroller');

router.get('/', function(req, res, next) {
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