const db = require('../Model/connection')
const bcrypt = require('bcrypt')

module.exports = {

    doSignup: (userData) => {
        return new Promise((resolve, reject) => {
            db.users.find({ email: userData.email }).then(async (data) => {
                if (data.length == 0) {
                    let response = {}
                    try {
                        userData.password = await bcrypt.hash(userData.password, 10)
                        let data = db.users(userData)
                        data.save()
                        response.user = data;
                        response.status = true
                        resolve(response)
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    resolve({ status: false })
                }
            })
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.users.findOne({ email: userData.email })
            let response = {}
            if (user) {
                bcrypt.compare(userData.password, user.password).then((loginTrue) => {
                    if (loginTrue) {
                        response.user = user;
                        response.status = true;
                        resolve(response)
                    } else {
                        console.log("Login failed password")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Login failed email")
                resolve({ status: false })
            }
        })
    },

    getAllusers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = db.users.find({})
                resolve(users)

            } catch (error) {
                console.log(error)
            }
        })
    },

    addUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.users(userData)
                data.save()
                resolve()
            } catch (error) {
                console.log(error);
            }
        })
    },

    getUserdetails: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.users.findOne({ _id: userId }).then((user) => {
                    resolve(user)
                })
            } catch (error) {
                console.log(error);
            }
        })
    },

    updateUser: (userId, userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.users.updateOne({ _id: userId }, {
                    $set: {
                        fName: userData.fName,
                        lName: userData.lName,
                        email: userData.email,
                        contactNo: userData.contactNo
                    }
                }).then(() => {
                    resolve()
                })
            } catch (error) {
                console.log(error)
            }
        })
    },

    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.users.updateOne({ _id: userId }, {
                    $set: {
                        status: false
                    }
                }).then(() => {
                    resolve()
                })
            } catch (error) {
                console.log(error);
            }
        })
    },

    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.users.updateOne({ _id: userId }, {
                    $set: {
                        status: true
                    }
                }).then(() => {
                    resolve()
                })
            } catch (error) {
                console.log(error);
            }
        })
    },
    getUser: (user) => {
        return new Promise((resolve, reject) => {
            try {
                db.users.findOne({ _id: user._id }).then((response) => {
                    console.log(response)
                    resolve(response.status)
                })
            } catch (error) {
                console.log(error)
            }
        })
    }

}


