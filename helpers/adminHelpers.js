const db = require('../Model/connection')

let arr = []
let arr2 = []
let arr3 = []
let arrDataDay = []
let arrDataYear = []
module.exports = {

    doAdminlogin: (adminData) => {
        console.log(adminData);
        return new Promise(async (resolve, reject) => {
            let admin = await db.admin.findOne({ email: adminData.email })
            let response = {}
            if (admin) {
                response.admin = admin;
                response.status = true;
                resolve(response)
            } else {
                resolve({ status: false })
            }

        })
    },

    getrevenuebyMonth: async () => {
        return new Promise(async (resolve, reject) => {

            for (let i = 0; i < 12; i++) {
                let price = await db.order.aggregate(
                    [
                        {
                            "$unwind": "$orders"
                        },
                        {
                            "$unwind": "$orders.productDetails"
                        },

                        {
                            "$match": {
                                "$expr": {
                                    "$eq": [
                                        {
                                            "$month": "$orders.createdAt"
                                        },
                                        i + 1
                                    ]
                                }
                            }
                        },
                        {
                            "$match": { 'orders.productDetails.delivery': 'Delivered' }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: { $multiply: ['$orders.productDetails.productPrice', '$orders.productDetails.quantity'] } },
                                orders: { $sum: '$orders.productDetails.quantity' },
                                totalOrder: { $sum: 1 }
                            }
                        },


                    ])
                arr[i + 1] = price[0]
            }
            for (i = 0; i < 12; i++) {
                if (arr[i + 1] == undefined) {
                    arr[i + 1] = {
                        total: 0,
                        orders: 0,
                        count: 0,
                    }
                } else {
                    arr[i]
                }
            }

            resolve({ arr })


        })
    },

    getrevenueDaily: () => {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i <= 30; i++) {
                let price = await db.order.aggregate([

                    {
                        "$unwind": "$orders"
                    },
                    {
                        "$unwind": "$orders.productDetails"
                    },
                    {
                        "$match": { 'orders.productDetails.delivery': 'Delivered' }
                    },
                    {
                        "$match": {
                            "$expr": {
                                "$eq": [
                                    {
                                        "$dayOfMonth": "$orders.createdAt"
                                    },
                                    i + 1
                                ]
                            }
                        }
                    },

                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$orders.productDetails.productPrice', '$orders.productDetails.quantity'] } },
                            orders: { $sum: '$orders.productDetails.quantity' },
                            totalOrder: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0
                        }
                    },

                ])
                arr2[i + 1] = price[0]?.total
                arrDataDay[i] = price[0]
            }

            let dateTodayRevenue = await arrDataDay[new Date().getDate() - 1]
            resolve({ arr2, dateTodayRevenue })
        })

    },

    getrevenueYearly: () => {
        return new Promise(async (resolve, reject) => {
            for (let i = 2017; i < 2023; i++) {
                let price = await db.order.aggregate([

                    {
                        "$unwind": "$orders"
                    },
                    {
                        "$unwind": "$orders.productDetails"
                    },
                    {
                        "$match": { 'orders.productDetails.delivery': 'Delivered' }
                    },
                    {
                        "$match": {
                            "$expr": {
                                "$eq": [
                                    {
                                        "$year": "$orders.createdAt"
                                    },
                                    i
                                ]
                            }
                        }
                    },

                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$orders.productDetails.productPrice', '$orders.productDetails.quantity'] } },
                            orders: { $sum: '$orders.productDetails.quantity' },
                            totalOrder: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0
                        }
                    },

                ])
                arr3[i] = price[0]?.total
                arrDataYear[i] = price[0]
            }
            let dataYearly = await arrDataYear[new Date().getFullYear()]
            resolve({ arr3, dataYearly })

        })
    },

    getorderCount: () => {
        return new Promise((resolve, reject) => {
            db.order.aggregate([
                {
                    $unwind: '$orders',
                },
                {
                    $unwind: '$orders.productDetails'
                },
                {
                    $match: { 'orders.productDetails.delivery': 'Delivered' }
                },
                {
                    $group:
                    {
                        _id: null,
                        count: { $sum: "$orders.productDetails.quantity" }
                    }
                },
                {
                    $project: {
                        _id: 0,

                    }
                }
            ]).then((count) => {
                // console.log("orders",count);
                resolve(count)
            })
        })
    },

    getPayMethodCount: () => {
        return new Promise((resolve, reject) => {
            db.order.aggregate([
                {
                    $unwind: '$orders',
                },
                {
                    $group:
                    {
                        _id: "$orders.paymentMethod", count: { $sum: 1 }
                    }
                }
            ]).then((e) => {
                resolve(e)
            })
        })
    },

    getRevenuebyMonth1: (year) => {
        return new Promise((resolve, reject) => {
            db.order.aggregate([
                {
                    $unwind:"$orders"
                },
                {
                    $unwind:"$orders.productDetails"
                },
                {
                    $match:{'orders.createdAt': { $gt: new Date(`${year}-01-01`),$lt:new Date(`${year}-12-31`) }}
                },
                {
                    $match:{'orders.productDetails.delivery':'Delivered'}
                },
                {
                    $group:{
                        _id:{'$month':"$orders.createdAt"},
                        totalCount:{$sum: { $multiply: ['$orders.productDetails.productPrice', '$orders.productDetails.quantity'] }},
                        orders:{$sum:1},
                        totalQuantity:{$first:'$orders.totalQuantity'},
                    }
                }
        ]).then((data)=>{
                resolve(data)
            })
        })
    },

    getRevenuebyYear:(year)=>{
        return new Promise((resolve, reject) => {
            db.order.aggregate([
                {
                    $unwind:"$orders"
                },
                {
                    $unwind:"$orders.productDetails"
                },
                {
                    $match:{'orders.createdAt': { $gt: new Date(`${year-5}-01-01`),$lt:new Date(`${year}-12-31`) }}
                },
                {
                    $match:{'orders.productDetails.delivery':'Delivered'}
                },
                {
                    $group:{
                        _id:{'$year':"$orders.createdAt"},
                        totalCount:{$sum: { $multiply: ['$orders.productDetails.productPrice', '$orders.productDetails.quantity'] }},
                        orders:{$sum:1},
                        totalQuantity:{$sum:'$orders.totalQuantity'},
                    }
                }
        ]).then((data)=>{
                resolve(data)
            })
        })
    },

    getRevenuebyDay:(month,year)=>{
        console.log(month);
        return new Promise((resolve, reject) => {
            db.order.aggregate([
                {
                    $unwind:"$orders"
                },
                {
                    $unwind:"$orders.productDetails"
                },
                {
                    $match:{'orders.createdAt': { $gt: new Date(`${year}-${month}-01`),$lt:new Date(`${year}-${month}-31`) }}
                },
                {
                    $match:{'orders.productDetails.delivery':'Delivered'}
                },
                {
                    $group:{
                        _id:{'$dayOfMonth':"$orders.createdAt"},
                        totalCount:{$sum: { $multiply: ['$orders.productDetails.productPrice', '$orders.productDetails.quantity'] }},
                        orders:{$sum:1},
                        totalQuantity:{$first:'$orders.totalQuantity'},
                    }
                },
                {
                    $sort:{
                        "orders.createdAt":-1
                    }
                }
        ]).then((data)=>{
                resolve(data)
            })
        })
    }
}