const { coupen } = require('../Model/connection');
const db = require('../Model/connection')


module.exports = {

    addCoupon: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                discountAmount = data.amount == "" ? 0 : parseInt(data.amount)
                discountPercentage = data.percentage == "" ? 0 : parseInt(data.percentage)
                cappedAmount = data?.cappedAmount == "" ? 0 :parseInt(data?.cappedAmount)
                let coupenObj = {
                    coupon: data.coupon,
                    discountType: data.discountType,
                    amount: discountAmount,
                    amountValidity: data.amountValidity,
                    cappedAmount:cappedAmount,
                    percentage: discountPercentage,
                    validityTill: data.validity,
                    description: data.description,
                    usageValidity: data.redeemTime
                }
                let coupon = await db.coupen(coupenObj)
                await coupon.save()
                resolve({ status: true })

            } catch (error) {
                console.log(error);
            }

        })
    },

    verifyCoupen: (data, user) => {
        console.log(data);
        return new Promise((resolve, reject) => {
            try {
                db.coupen.findOne({ coupon: data }).then(async (response) => {
                    console.log("res=>", response);
                    if (response) {
                        let couponExist = await db.users.findOne({ _id: user, 'coupon.name': data })
                        if (!couponExist) {
                            let couponData = {
                                name: data,
                                purchased: false
                            }
                            db.users.updateOne({ _id: user }, {
                                $push: {
                                    coupon: couponData
                                }
                            }).then((e) => {
                                console.log(e);
                                resolve({ status: true })
                            })
                        } else {
                            resolve({ coupon: true })
                        }
                    } else {
                        resolve({ status: false })
                    }
                })
            } catch (err) {
                console.log(err);
            }
        })
    },

    checkCoupon: (data, user) => {
        return new Promise(async (resolve, reject) => {
            try {
                let purchased = await db.users.aggregate([{
                    $match: { _id: user }
                },
                {
                    $unwind: '$coupon'
                },
                {
                    $match: {
                        $and: [{
                            'coupon.name': data,
                            'coupon.purchased': false
                        }
                        ]
                    }
                }
                ])
                console.log("asd", purchased);
                if (!purchased.length) {
                    resolve({ purchased: true })
                } else {
                    resolve({ purchased: false })
                }
            } catch (error) {
                console.log(error);
            }
        })
    },

    applyCoupon: (data, user, total) => {
        return new Promise(async (resolve, reject) => {
            try {
                let couponData = await db.coupen.findOne({ coupon: data })
                // console.log("couponData",couponData);
                if (couponData) {

                    if ((new Date(couponData.validityTill) - new Date()) > 0 && couponData.usageValidity > 0) {
                        let amountValid = await couponData.amountValidity.split("-")
                        if (couponData.discountType == "Amount") {
                            if (total >= amountValid[0] && total <= amountValid[1]) {
                                let discountAmount = Math.floor(couponData.amount)
                                let finalAmount = Math.floor(total - couponData.amount)
                                resolve({ finalAmount, discountAmount })
                            } else {
                                resolve({ couponNotApplicable: true, amountValid })
                            }
                        } else {
                            if (total >= amountValid[0] && total <= amountValid[1]) {
                                let discountAmount = await ((total * couponData.percentage) / 100)
                                let finalAmount = Math.floor(total - discountAmount)
                                discountAmount = Math.floor(discountAmount)
                                resolve({ finalAmount, discountAmount })
                            } else {
                                resolve({ couponNotApplicable: true, amountValid })
                            }
                        }
                    } else {
                        resolve({ couponExpired: true })
                    }
                }
            } catch (error) {
                console.log(error);
            }
        })
    }

}
