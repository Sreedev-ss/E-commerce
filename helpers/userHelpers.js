require('dotenv').config()
const db = require('../Model/connection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const razorpay = require('razorpay')
const razorpayId = require('../helpers/razorpayHelpers')
var instance = new razorpay({
    key_id: razorpayId.secretId,
    key_secret: razorpayId.secretKey,
});
const crypto = require('crypto')



// const paypal = require("paypal-rest-sdk")

// paypal.configure({
//     'mode': 'sandbox', //sandbox or live
//     'client_id': process.env.PAYPAL_CLIENT_ID,
//     'client_secret': process.env.PAYPAL_CLIENT_SECRET,
// });


module.exports = {

    doSignup: (userData) => {
        return new Promise((resolve, reject) => {
            try {
                db.users.find({ email: userData.email }).then(async (data) => {
                    if (data.length == 0) {
                        let response = {}

                        userData.password = await bcrypt.hash(userData.password, 10)
                        let data = await db.users(userData)
                        await data.save()
                        response.user = data;
                        response.status = true
                        resolve(response)

                    } else {
                        resolve({ status: false })
                    }

                })
            } catch (error) {
                reject(error)
            }
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
                let users = await db.users.find({})
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
                }).catch(error => { console.log(error) })
            } catch (error) {
                console.log(error)
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
                }).catch(error => { console.log(error) })
            } catch (error) {
                console.log(error)
            }

        })
    },
    getUser: (user) => {
        return new Promise((resolve, reject) => {
            try {

                db.users.findOne({ _id: user._id }).then((response) => {
                    console.log(response)
                    resolve(response.status)
                }).catch(error => { console.log(error) })
            } catch (error) {
                console.log(error)
            }
        })
    },

    getCartProducts: (userId) => {
        return new Promise((resolve, reject) => {
            try {
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
            } catch (error) {
                console.log(error)
            }
        })
    },

    addtoCart: (proId, userId) => {
        let proObj = {
            item: proId,
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.cart.findOne({ user: userId })
                if (userCart) {
                    let prodExist = userCart.cartProducts.findIndex(cartProducts => cartProducts.item == proId)
                    console.log(prodExist);
                    if (prodExist != -1) {
                        db.cart.updateOne({ user: userId, 'cartProducts.item': proId },
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
            } catch (error) {
                console.log(error)
            }
        })
    },

    getCartCount: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                let cartCount = 0
                db.cart.findOne({ user: userId }).then((cart) => {
                    if (cart) {
                        for (var i = 0; i < cart.cartProducts.length; i++) {

                            cartCount += cart.cartProducts[i].quantity

                        }
                    }
                    resolve(cartCount)
                }).catch(error => { console.log(error) })
            } catch (error) {
                console.log(error)
            }
        })
    },

    getProQty: (userId, proId) => {
        let response = {}
        console.log(proId);
        return new Promise((resolve, reject) => {
            try {
                db.products.findOne({ _id: proId }).then((items) => {
                    // console.log("logItems",items.quantity);
                    response.proQty = items?.quantity
                    db.cart.aggregate([
                        {
                            $match: { user: ObjectId(userId) }
                        },
                        {
                            $unwind: '$cartProducts'
                        },
                        {
                            $match: { 'cartProducts.item': ObjectId(proId) }
                        },
                        {
                            $project: {
                                _id: 0,
                                quantity: '$cartProducts.quantity'
                            }
                        },

                    ]).then((data) => {
                        response.cartQty = data[0]?.quantity
                        // console.log(data[0].quantity);
                        resolve(response)
                    })
                })
            } catch (error) {
                console.log(error)
            }
        })
    },

    changeProductQuantity: (data) => {
        data.count = parseInt(data.count)
        return new Promise((resolve, reject) => {
            try {
                db.cart.updateOne({ _id: data.cart, 'cartProducts.item': data.product },
                    {
                        $inc: { 'cartProducts.$.quantity': data.count }
                    }

                ).then(() => {
                    resolve({ status: true })
                }).catch(error => { console.log(error) })

            } catch (error) {
                console.log(error)
            }
        })

    },

    getTotalCount: (userId) => {
        return new Promise((resolve, reject) => {
            try {

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
            } catch (error) {
                console.log(error)
            }

        })
    },

    deleteCartItems: (data) => {
        return new Promise((resolve, reject) => {
            try {
                db.cart.updateOne({ _id: data.cart }, {
                    $pull: {
                        cartProducts: { item: data.product }
                    }
                }).then(() => {
                    resolve({ removeProduct: true })
                }).catch(error => { console.log(error) })
            } catch (error) {
                console.log(error)
            }
        })
    },

    placeOrder: (order, total, couponPrice) => {
        return new Promise(async (resolve, reject) => {
            try {

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
                        $set: { 'cartItems': { deliveredAt: undefined } }
                    },
                    {
                        $project: {
                            _id: '$cartItems._id',
                            quantity: 1,
                            productName: '$cartItems.name',
                            productPrice: '$cartItems.price',
                            status: '$cartItems.status',
                            delivery: '$cartItems.Delivery',
                            deliveredAt: '$cartItems.deliveredAt',
                            productCategory: '$cartItems.category'
                        }
                    }
                ])

                let totalQuantity = 0
                for (let i = 0; i < product.length; i++) {
                    totalQuantity += await product[i].quantity
                    await db.products.updateOne({ _id: product[i]._id }, {
                        $inc: { quantity: -product[i].quantity }
                    })
                }



                console.log("totalQuantity=>", totalQuantity);

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
                };


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
                                }).catch(err => console.log(err))
                        } else {
                            console.log("Exit")
                        }

                    })
                } else {
                    db.address(addressObj).save()
                }

                let address = {
                    address: order.address,
                    landmark: order.landmark,
                    town: order.town,
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
                        totalQuantity: totalQuantity,
                        totalPrice: total,
                        createdAt: new Date(),
                        shippingAddress: address,
                        couponDiscount: couponPrice,
                        couponName: order.couponName
                    }]
                }

                console.log(orderObj);

                let user_order = await db.order.findOne({ userId: order.userId })
                if (user_order) {
                    console.log("order=>", order);
                    db.order.updateOne({ userId: order.userId }, {
                        $push: {
                            orders: [
                                {
                                    fName: order.fName,
                                    lName: order.lName,
                                    mobile: order.mobile,
                                    paymentMethod: order.paymentMethod,
                                    productDetails: product,
                                    totalQuantity: totalQuantity,
                                    totalPrice: total,
                                    createdAt: new Date(),
                                    shippingAddress: address,
                                    couponDiscount: couponPrice,
                                    couponName: order.couponName
                                }
                            ]

                        }
                    }).then((e) => {
                        console.log("upserted", e);
                    }).catch(err => console.log(err))
                } else {
                    console.log('save');
                    const savedData = await db.order(orderObj);
                    await savedData.save();
                    console.log('saved data => ', savedData);
                }

                let userData = await db.users.find({ _id: order.userId, 'coupon.name': order.couponName })
                let couponIndex = await userData[0]?.coupon.findIndex(dataFind => dataFind.name == order.couponName)
                if (couponIndex >= 0) {
                    let dbuserCoupenUpdate = await db.users.updateOne({ _id: order.userId, 'coupon.name': order.couponName }, {
                        $set: {
                            ['coupon.' + couponIndex + '.purchased']: true
                        }
                    })
                    let dbCoupencount = await db.coupen.updateOne({ coupon: order.couponName }, {
                        $inc: {
                            usageValidity: -1
                        }
                    })
                }
                db.cart.deleteMany({ user: order.userId }).then(() => {
                    resolve({ status: true })
                }).catch(err => console.log(err))

                // resolve({status:true});

            } catch (error) {
                console.log(error);
            }

        })

    },

    razorpay: async (total, user) => {
        try {
            let id = await db.order.find({ userId: user })
            let length = id[0].orders.length
            let orderId = id[0].orders[length - 1]._id;

            let userName = id[0].orders[length - 1].fName;
            let mobile = id[0].orders[length - 1].mobile;
            let email = id[0].orders[length - 1].shippingAddress.email;
            total = total * 100
            return new Promise((resolve, reject) => {
                var options = {
                    amount: total,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + orderId
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        console.log("razorpayErr :", err);
                    }
                    order.userName = userName
                    order.mobile = mobile,
                        order.email = email
                    console.log("razorpayOrder : ", order);
                    resolve(order)
                });
            })
        } catch (error) {
            console.log(error)
        }
    },

    deleteRazorpay: (user) => {
        return new Promise(async (resolve, reject) => {
            try {
                let id = await db.order.find({ userId: user, 'orders.paymentMethod': 'Razorpay', 'orders.paymentStatus': 'Pending' })
                let length = id[0].orders.length
                let orderId = id[0].orders[length - 1]._id;
                db.order.updateOne({ userId: user }, {
                    $pull: {
                        orders: { _id: orderId }
                    }
                }).then((e) => {
                    console.log(e, "asdasdf");
                    resolve()
                })
            } catch (error) {

            }
        })
    },


    verifyPayment: (data) => {
        console.log(data);
        try {
            return new Promise((resolve, reject) => {
                let hmac = crypto.createHmac('sha256', razorpayId.secretKey)
                hmac.update(data['payment[razorpay_order_id]'] + '|' + data['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')

                if (hmac == data['payment[razorpay_signature]']) {
                    resolve({ status: true })
                } else {
                    console.log('err');
                    reject("Payment failed")
                }
            })
        } catch (error) {
            console.log(error)
        }
    },

    updatePaymentStatusRazorpay: (data) => {
        console.log(data);
        try {
            return new Promise(async (resolve, reject) => {
                let order = await db.order.find({ 'orders._id': data })
                console.log(order);
                if (order) {
                    let orderIndex = order[0].orders.findIndex(order => order._id == data)
                    console.log(orderIndex);
                    db.order.updateOne({ 'orders._id': data }, {
                        $set: {
                            ['orders.' + orderIndex + '.paymentStatus']: 'Paid'
                        }
                    }).then((e) => {
                        console.log(e);
                        resolve({ status: true })
                    })
                }
            })
        } catch (error) {
            console.log(error)
        }
    },

    updatePaymentStatusPaypal: async (user) => {
        try {
            let id = await db.order.find({ userId: user })
            let length = await id[0].orders.length
            let orderId1 = await id[0].orders[length - 1]._id;
            let orderId = orderId1 + ""
            console.log("Hey");
            console.log(orderId);
            return new Promise(async (resolve, reject) => {
                let order = await db.order.find({ 'orders._id': orderId })
                console.log(order);
                if (order) {
                    let orderIndex = order[0].orders.findIndex(order => order._id == orderId)
                    console.log(orderIndex);
                    db.order.updateOne({ 'orders._id': orderId }, {
                        $set: {
                            ['orders.' + orderIndex + '.paymentStatus']: 'Paid'
                        }
                    }).then((e) => {
                        console.log(e);
                        resolve({ status: true })
                    })
                }
            })
        } catch (error) {
            console.log(error)
        }
    },



    addAddress: (data, userId) => {
        console.log("data=>", data);
        return new Promise(async (resolve, reject) => {
            try {
                let addressNew = {
                    fName: data.fName,
                    lName: data.lName,
                    address: data.address,
                    landmark: data.landmark,
                    town: data.town,
                    country: data.country,
                    postcode: data.postcode,
                    mobile: data.mobile,
                    email: data.email
                }
                let addressObj = {
                    user: userId,
                    address: [addressNew]
                }
                let addressDoc = await db.address.findOne({ user: userId })

                if (addressDoc) {
                    db.address.find({ 'address.fName': data.fName, 'address.lName': data.lName, 'address.postcode': data.postcode, 'address.mobile': data.mobile }).then((res) => {
                        console.log(res);
                        if (res.length == 0) {
                            console.log("Entered");
                            db.address.updateOne({ user: userId },
                                {
                                    $push: {
                                        address: addressNew
                                    }
                                }).then((data) => {
                                    console.log(data);
                                    resolve()
                                }).catch(err => console.log(err))
                        } else {
                            console.log("Exit")
                        }

                    })
                } else {
                    db.address(addressObj).save()
                    resolve()
                }
            } catch (error) {
                console.log(error) //TODO redirect to something went room ! 
            }
        })

    },

    editAddress: (data, Id, user) => {
        console.log("data=>", data);
        return new Promise(async (resolve, reject) => {
            try {
                let addressObj = await db.address.find({ user: user })
                console.log(addressObj);

                if (addressObj) {
                    let addressIndex = addressObj[0].address.findIndex(address => address._id == Id)
                    console.log(addressIndex);

                    let address = {
                        fName: data.fName,
                        lName: data.lName,
                        address: data.address,
                        landmark: data.landmark,
                        town: data.town,
                        country: data.country,
                        postcode: data.postcode,
                        mobile: data.mobile,
                        email: data.email
                    }

                    db.address.updateOne({ 'address._id': Id }, {
                        $set: {
                            ['address.' + addressIndex]: address
                        }
                    }).then((e) => {
                        console.log(e);
                        resolve()
                    })
                }
            } catch (error) {
                console.log(error)
            }
        })
    },

    deleteAddress: (addrId, userId) => {
        console.log(addrId, userId);
        return new Promise((resolve, reject) => {
            try {
                db.address.updateOne({ user: userId }, {
                    $pull: {
                        address: { _id: addrId }
                    }
                }).then((e) => {
                    console.log(e);
                    resolve()
                })
            } catch (error) {
                console.log(error)
            }
        })
    },

    updateProfile: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.users.findOne({ _id: userId })
                console.log("user", user);
                if (user) {
                    bcrypt.compare(data.currentPassword, user.password).then(async (loginTrue) => {
                        if (loginTrue) {
                            data.confirmPasswordPro = await bcrypt.hash(data.confirmPasswordPro, 10)
                            db.users.updateOne({ _id: userId }, {
                                $set: {
                                    fName: data.fName,
                                    lName: data.lName,
                                    email: data.email,
                                    password: data.confirmPasswordPro
                                }
                            }).then(() => {
                                resolve({ status: true })
                            })
                        } else {
                            resolve({ status: false })
                        }
                    })
                }
            } catch (error) {
                console.log(error);
            }
        })
    },


    getUserData: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userData = await db.users.findOne({ _id: userId })
                // console.log(userData);

                db.users.aggregate([
                    {
                        $match: { _id: userId }
                    },
                    {
                        $project: {
                            _id: 0,
                            totalWallet: { $sum: "$wallet.price" }
                        }
                    }

                ]).then((value) => {
                    resolve(value[0])
                })
            } catch (error) {
                console.log(error);
            }
        })
    },

    addressFind: (addrId, userId) => {
        return new Promise((resolve, reject) => {
            try {
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
            } catch (error) {
                console.log(error)
            }
        })
    },

    getAdminOrder: () => {
        return new Promise((resolve, reject) => {
            try {
                // db.order.find({}).then((data) => {
                //     console.log("All orders => ", data);
                // })
                db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $sort: { 'orders.createdAt': -1 }
                    }
                ]).then((data) => {

                    resolve(data)
                })
            } catch (error) {
                console.log(error)
            }

        })
    },
    getAdminOrderPag: (skip, limit) => {
        console.log(skip, limit);
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $sort: { 'orders.createdAt': -1 }
                    },
                    {
                        $limit: limit
                    },
                    {
                        $skip: skip
                    }
                ]).then((data) => {

                    resolve(data)
                })
            } catch (error) {
                console.log(error)
            }

        })
    },

    getOrders: (userId) => {
        return new Promise((resolve, reject) => {
            try {
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
            } catch (error) {
                console.log(error)
            }
        })
    },

    getOrderDetails: (orderId) => {
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: { 'orders._id': ObjectId(orderId) }
                    },
                    {
                        $sort: {
                            'orders.createdAt': -1
                        }
                    }


                ]).then((data) => {
                    resolve(data)
                })
            } catch (error) {
                console.log(error)
            }
        })
    },


    getOrderDetailsUser: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([

                    {
                        $match: { userId: userId }
                    },
                    {
                        $unwind: '$orders'
                    },
                    {
                        $sort: {
                            'orders.createdAt': -1
                        }
                    }


                ]).then((data) => {
                    resolve(data)
                })
            } catch (error) {
                console.log(error)
            }
        })
    },

    orderCancel: (Id, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.order.find({ 'orders._id': Id.orderId })
                if (order) {
                    let orderIndex = order[0].orders.findIndex(order => order._id == Id.orderId)
                    let productIndex = order[0].orders[orderIndex].productDetails.findIndex(product => product._id == Id.proId)
                    db.order.updateOne({ 'orders._id': Id.orderId }, {
                        $set: {
                            ['orders.' + orderIndex + '.productDetails.' + productIndex + '.status']: false,
                            ['orders.' + orderIndex + '.productDetails.' + productIndex + '.delivery']: 'Cancelled',
                            ['orders.' + orderIndex + '.paymentStatus']: 'Returned'

                        }
                    }).then((e) => {
                        // console.log(e);
                        let quantity = order[0].orders[orderIndex].productDetails[productIndex].quantity
                        console.log("quantity=>", quantity);
                        db.products.updateOne({ _id: Id.proId }, {
                            $inc: { quantity: quantity }
                        }).then(() => {

                            resolve({ status: true })
                        })
                    })
                }
            } catch (error) {
                console.log(error)
            }
        })
    },

    updateOrder: (data, user) => {
        let orderId = data.order.trim()
        let proId = data.product.trim()
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.order.find({ 'orders._id': `${orderId}` })
                if (order) {
                    let orderIndex = order[0].orders.findIndex(order => order._id == `${orderId}`)
                    let productIndex = order[0].orders[orderIndex].productDetails.findIndex(product => product._id == `${proId}`)
                    db.order.updateOne({ 'orders._id': `${orderId}` }, {
                        $set: {
                            ['orders.' + orderIndex + '.productDetails.' + productIndex + '.delivery']: data.delivery,
                            ['orders.' + orderIndex + '.paymentStatus']: 'Paid'
                        }
                    }).then(async (e) => {
                        if (data.delivery == "Delivered") {
                            let updateDelDate = await db.order.updateOne({ 'orders._id': `${orderId}` }, {
                                $set: {
                                    ['orders.' + orderIndex + '.productDetails.' + productIndex + '.deliveredAt']: new Date(),
                                }
                            })
                        }
                        console.log(e);
                        resolve({ status: true })
                    })
                }
            } catch (error) {
                console.log(error)
            }
        })
    },

    returnProduct: (data, user) => {
        let orderId = data.orderId
        let proId = data.proId
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.order.find({ 'orders._id': `${orderId}` })
                if (order) {
                    let orderIndex = order[0].orders.findIndex(order => order._id == `${orderId}`)
                    let productIndex = order[0].orders[orderIndex].productDetails.findIndex(product => product._id == `${proId}`)
                    db.order.aggregate([
                        {
                            $match: { userId: ObjectId(user) }
                        },
                        {
                            $unwind: '$orders'
                        },
                        {
                            $unwind: '$orders.productDetails'
                        },
                        {
                            $match: {
                                $and: [{ 'orders._id': ObjectId(`${orderId}`), 'orders.productDetails._id': ObjectId(`${proId}`) }]
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                dateDelivered: '$orders.productDetails.deliveredAt'
                            }
                        }
                    ]).then((deliveryDate) => {
                        console.log(deliveryDate[0].dateDelivered);
                        let dateOrg = deliveryDate[0].dateDelivered
                        if (new Date(new Date(dateOrg).setDate(new Date(dateOrg).getDate() + 7) - new Date(dateOrg).setDate(new Date(dateOrg).getDate())) <= 0) {
                            console.log("hi");
                            resolve({ status: false })
                        } else {
                            db.order.updateOne({ 'orders._id': `${orderId}` }, {
                                $set: {
                                    ['orders.' + orderIndex + '.productDetails.' + productIndex + '.delivery']: 'Product Returned',
                                    ['orders.' + orderIndex + '.productDetails.' + productIndex + '.status']: false

                                }
                            }).then((e) => {
                                console.log(e);
                                // resolve({ status: true })

                                db.order.aggregate([{
                                    $match: { userId: ObjectId(user) }
                                },
                                {
                                    $unwind: '$orders'
                                },
                                {
                                    $unwind: '$orders.productDetails'
                                },
                                {

                                    $match: { $and: [{ 'orders._id': ObjectId(orderId), 'orders.productDetails._id': ObjectId(proId) }] }
                                }

                                ]).then((aggrData) => {
                                    let priceToWallet = {
                                        price: 0
                                    }
                                    console.log(aggrData);
                                    let totalPrice = aggrData[0].orders.productDetails.productPrice * aggrData[0].orders.productDetails.quantity
                                    console.log(totalPrice);
                                    if (aggrData[0].orders.totalPrice - totalPrice < 0) {
                                        priceToWallet.price = aggrData[0].orders.totalPrice
                                    } else {
                                        priceToWallet.price = totalPrice
                                    }

                                    db.products.updateOne({ _id: proId }, {
                                        $inc: { quantity: aggrData[0].orders.productDetails.quantity }
                                    }).then((e) => {
                                    })

                                    db.users.updateOne({ _id: user }, {
                                        $push: {
                                            wallet: priceToWallet
                                        }
                                    }).then((e) => {
                                        resolve({ status: true })
                                    })
                                })

                            })
                        }
                    })

                }
            } catch (error) {
                console.log(error);
            }
        })
    },

    getOrderInvoice: (proId, orderId) => {
        console.log(proId, orderId);
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.order.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: { $and: [{ 'orders._id': ObjectId(orderId), 'orders.productDetails._id': ObjectId(proId) }] }
                    }
                ])
                console.log("invoice aggregate", data);
                resolve({ data, status: true })
            } catch (error) {
                console.log(error);
            }
        })
    },

    shopByCategory: (data) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.products.aggregate([
                {
                    $match: { category: data }
                }
            ])

            console.log(product, data);
            resolve(product)
        })
    }

}


