const axios = require('axios');

module.exports = {
    sendResponse: function(req, res, next) {
        const data = req.placeholderData;
        res.json(data);
    },
    formatData: function(req, res, next) {
        const userResponse = req.placeholderData || {};
        let formattedData;
        if (Array.isArray(userResponse)) {
            formattedData = userResponse && userResponse.map(adhoc => {
                return this.createUserObject(adhoc);
            }) || [];
        } else if(Object.keys(userResponse).length) {
            formattedData = this.createUserObject(userResponse);
        } else {
            formattedData = {}
        }
        req.placeholderData = formattedData;
        next();
    },
    createUserObject: function(data) {
        if (data && Object.keys(data).length) {
            return {
                id: data.id,
                name: data.name,
                username: data.username,
                email: data.email
            }
        } else {
            return {};
        }
    },
    fetchUsers: function(url) {
        return new Promise((resolve, reject) => {
            if (url) {
                axios.get(url)
                .then(success => {
                    resolve(success.data);
                })
                .catch(error => {
                    reject({message: error.message, status: error.response.status});
                })
            } else {
                reject({message: "URL is required"});
            }
        })
    },
    saveUser: function(url, user) {
        return new Promise((resolve, reject) => {
            if (url && user && Object.keys(user).length) {
                axios.post(url, user)
                .then(success => {
                    resolve(success.data);
                })
                .catch(error => {
                    reject({message: error.message, status: error.response.status});
                })
            } else {
                reject({message: "URL/User is not defined"});
            }
        })
    }
}