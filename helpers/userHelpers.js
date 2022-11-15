const db = require('../Model/connection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { address } = require('../Model/connection')
const { Orders } = require('../Controller/userController')
const e = require('express')

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

            db.users.updateOne({ _id: userId }, {
                $set: {
                    status: false
                }
            }).then(() => {
                resolve()
            }).catch(error => { console.log(error) })

        })
    },

    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {

            db.users.updateOne({ _id: userId }, {
                $set: {
                    status: true
                }
            }).then(() => {
                resolve()
            }).catch(error => { console.log(error) })

        })
    },
    getUser: (user) => {
        return new Promise((resolve, reject) => {

            db.users.findOne({ _id: user._id }).then((response) => {
                console.log(response)
                resolve(response.status)
            }).catch(error => { console.log(error) })
        })
    },

    getCartProducts: (userId) => {
        return new Promise((resolve, reject) => {
            db.cart.aggregate([
                {
                    $match: { user: userId }
                },
                {
                    $unwind: '$cartProducts'
                },
                {
                    $project: {
                        item: '$cartProducts.item',
                        quantity: '$cartProducts.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'cartItems'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$cartItems', 0] }
                    }
                }
            ]).then((cartItems) => {
                resolve(cartItems)
            }).catch(error => { console.log(error) })
        })
    },

    addtoCart: (proId, userId) => {
        let proObj = {
            item: proId,
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.cart.findOne({ user: userId })
            if (userCart) {
                let prodExist = userCart.cartProducts.findIndex(cartProducts => cartProducts.item == proId)
                console.log(prodExist);
                if (prodExist != -1) {
                    db.cart.updateOne({user:userId, 'cartProducts.item': proId },
                        {
                            $inc: { 'cartProducts.$.quantity': 1 }

                        }).then(() => {
                            resolve()
                        }).catch(error => { console.log(error) })
                } else {
                    db.cart.updateOne({ user: userId },
                        {
                            $push: {
                                cartProducts: proObj
                            }
                        }).then(() => {
                            resolve()
                        }).catch(error => { console.log(error) })
                }
            }
            else {
                let cartObj = {
                    user: userId,
                    cartProducts: [proObj]
                }
                db.cart(cartObj).save().then(() => {
                    resolve()
                }).catch(error => { console.log(error) })
            }
        })
    },

    getCartCount: (userId) => {
        return new Promise((resolve, reject) => {
            let cartCount = 0
            db.cart.findOne({ user: userId }).then((cart) => {
                if (cart) {
                    for (var i = 0; i < cart.cartProducts.length; i++) {

                        cartCount += cart.cartProducts[i].quantity

                    }
                }
                resolve(cartCount)
            }).catch(error => { console.log(error) })
        })
    },

    changeProductQuantity: (data) => {
        data.count = parseInt(data.count)
        return new Promise((resolve, reject) => {
            db.cart.updateOne({ _id: data.cart, 'cartProducts.item': data.product },
                {
                    $inc: { 'cartProducts.$.quantity': data.count }
                }

            ).then(() => {
                resolve({ status: true })
            }).catch(error => { console.log(error) })
        })
    },

    getTotalCount: (userId) => {
        return new Promise((resolve, reject) => {

            db.cart.aggregate([
                {
                    $match: { user: userId }
                },
                {
                    $unwind: '$cartProducts'
                },
                {
                    $project: {
                        item: '$cartProducts.item',
                        quantity: '$cartProducts.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'cartItems'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$cartItems', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$product.price', '$quantity'] } }
                    }
                }
            ]).then((total) => {
                resolve(total[0]?.total)
            }).catch(error => { console.log(error) })

        })
    },

    deleteCartItems: (data) => {
        return new Promise((resolve, reject) => {
            db.cart.updateOne({ _id: data.cart }, {
                $pull: {
                    cartProducts: { item: data.product }
                }
            }).then(() => {
                resolve({ removeProduct: true })
            }).catch(error => { console.log(error) })
        })
    },

    placeOrder: (order, total) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.cart.aggregate([
                {
                    $match: { user: order.userId }
                },
                {
                    $unwind: '$cartProducts'
                },
                {
                    $project: {
                        item: '$cartProducts.item',
                        quantity: '$cartProducts.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'cartItems'
                    }
                },
                {
                    $unwind: '$cartItems'
                },
                {
                    $set: { 'cartItems': { status: true } }
                },
                {
                    $set: { 'cartItems': { Delivery: 'Processing' } }
                },
                {
                    $project: {
                        _id: '$cartItems._id',
                        quantity: 1,
                        productName: '$cartItems.name',
                        productPrice: '$cartItems.price',
                        status: '$cartItems.status',
                        delivery: '$cartItems.Delivery'
                    }
                }
            ])

            let orderAddress = {
                fName: order.fName,
                lName: order.lName,
                address: order.address,
                landmark: order.landmark,
                town: order.town,
                country: order.country,
                postcode: order.postcode,
                mobile: order.mobile,
                email: order.email
            }

            console.log(orderAddress);

            let addressObj = {
                user: order.userId,
                address: [orderAddress]
            }
            let addressDoc = await db.address.findOne({ user: order.userId })
            if (addressDoc) {
                db.address.find({ 'address.fName': order.fName, 'address.lName': order.lName, 'address.postcode': order.postcode, 'address.mobile': order.mobile }).then((res) => {
                    console.log(res);
                    if (res.length == 0) {
                        console.log("Entered");
                        db.address.updateOne({ user: order.userId },
                            {
                                $push: {
                                    address: orderAddress
                                }
                            }).then((data) => {
                                console.log("address Push =>", data)
                            })
                    } else {
                        console.log("Exit")
                    }

                })
            } else {
                db.address(addressObj).save()
            }



            console.log(product);
            //Order
            let address = {
                address: order.address,
                landmark: order.landmark,
                town: order.town,
                city: order.city,
                country: order.country,
                postcode: parseInt(order.postcode),
                mobile: parseInt(order.mobile),
                email: order.email
            }

            let orderObj = {
                userId: order.userId,
                orders: [{
                    fName: order.fName,
                    lName: order.lName,
                    mobile: order.mobile,
                    paymentMethod: order.paymentMethod,
                    productDetails: product,
                    totalPrice: total,
                    shippingAddress: address
                }]
            }

            let user_order = await db.order.findOne({ userId: order.userId })
            if (user_order) {
                db.order.updateOne({ userId: order.userId }, {
                    $push: {
                        orders: [
                            {
                                fName: order.fName,
                                lName: order.lName,
                                mobile: order.mobile,
                                paymentMethod: order.paymentMethod,
                                productDetails: product,
                                totalPrice: total,
                                shippingAddress: address
                            }
                        ]

                    }
                }).then((e) => {
                    console.log(e);
                })
            } else {
                db.order(orderObj).save()
            }

            db.cart.deleteMany({ user: order.userId }).then(() => {
                resolve({ status: true })
            })

        })

    },

    addressFind: (addrId, userId) => {
        return new Promise((resolve, reject) => {
            db.address.aggregate([
                {
                    $match: { user: userId }
                },
                {
                    $unwind: '$address'
                },
                {
                    $match: { 'address._id': ObjectId(addrId) }
                }
            ]).then((data) => {
                resolve(data)
            })
        })
    },

    getAdminOrder: () => {
        return new Promise((resolve, reject) => {
            db.order.aggregate([
                {
                    $unwind: '$orders'
                },
                {
                    $unwind: '$orders.productDetails'
                },
                {
                    $unwind: '$orders.shippingAddress'
                },
                {
                    $sort: { 'orders.createdAt': -1 }
                }
            ]).then((data) => {
                // console.log("getAdminData=>", data);
                resolve(data)
            })

        })
    },

    getOrders: (userId) => {
        return new Promise((resolve, reject) => {
            db.order.aggregate([
                {
                    $match: { userId: userId }
                },
                {
                    $unwind: '$orders'
                },
                {
                    $unwind: '$orders.productDetails'
                },
                {
                    $unwind: '$orders.shippingAddress'
                },
                {
                    $sort: {
                        'orders.createdAt': -1
                    }
                }


            ]).then((data) => {
                resolve(data)
            })
        })
    },

    orderCancel: (Id, userId) => {
        return new Promise(async (resolve, reject) => {
            // console.log(Id);
            let order = await db.order.find({'orders._id':Id.orderId})
            // console.log("order cancel=>",order[0]);
            if (order) {
                let orderIndex = order[0].orders.findIndex(order => order._id == Id.orderId)
                // console.log(orderIndex);
                let productIndex = order[0].orders[orderIndex].productDetails.findIndex(product => product._id == Id.proId)
                // console.log(productIndex);
                db.order.updateOne({'orders._id':Id.orderId}, {
                    $set: {
                        ['orders.'+orderIndex+'.productDetails.' + productIndex + '.status']: false
                    }
                }).then((e) => {
                    console.log(e);
                    resolve({ status: true })
                })
            }
        })
    },

    updateOrder: (data,user) => {
        let orderId = data.order.trim()
        let proId = data.product.trim()
        // console.log("userId=>",user);
        // console.log("order=>",orderId,"pro=>",proId)
        return new Promise(async (resolve, reject) => {
            let order = await db.order.find({'orders._id':`${orderId}`})
            // console.log("order cancel=>",order[0]);
            if (order) {
                let orderIndex = order[0].orders.findIndex(order => order._id == `${orderId}`)
                // console.log("orderIndex=>",orderIndex);
                let productIndex = order[0].orders[orderIndex].productDetails.findIndex(product => product._id == `${proId}`)
                // console.log("productIndex=>",productIndex);
                db.order.updateOne({'orders._id':`${orderId}`}, {
                    $set: {
                        ['orders.'+orderIndex+'.productDetails.' + productIndex + '.delivery']: data.delivery
                    }
                }).then((e) => {
                    console.log(e);
                    resolve({ status: true })
                })
            }
        })
    }

}


