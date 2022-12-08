require('dotenv').config()

const userHelpers = require('../helpers/userHelpers')
const otpConfig = require('../helpers/otpHelpers')
const client = require('twilio')(otpConfig.accountSID, otpConfig.authToken);
const db = require('../Model/connection')
const productHelpers = require('../helpers/productHelpers');
const { response } = require('../app');
const { Convert } = require("easy-currencies");
const couponHelpers = require('../helpers/couponHelpers')

let couponPrice = 0

const paypal = require('@paypal/checkout-server-sdk')
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)



module.exports = {


  landingpage: async (req, res, next) => {
    try {
      let user = req.user
      let cartCount = await userHelpers.getCartCount(req.session.user)
      let banner = await db.banner.find({})
      res.render('user/landingPage', { cartCount, user ,banner});
    }
    catch (error) {
      res.render('error',{message:error.message,code:500,layout:'error-layout'});
    }


  },

  getProductData:async(req,res)=>{
    try{
      let data = await productHelpers.getProductData()
      res.send(data)
    }catch(err){
      res.render('error',{message:error?.message,code:500,layout:'error-layout'});
    }
  },

  getSignup: (req, res) => {
    try {
      if (req.session.userSignnedIn) {
        res.redirect('/')
      } else {
        res.render('user/signup', { nav: true })
      }
    } catch (error) {
      res.render('error',{message:error.message,code:500,layout:'error-layout'});
    }
  },

  postSignup: (req, res) => {
    try {
      console.log(req.body);
      userHelpers.doSignup(req.body).then((response) => {
        if (response.status) {
          req.session.user = response.user._id;

          res.send({ value: "Success" })
        } else {
          res.send({ value: 'anf' })
        }
      })
    } catch (error) {
      res.render('error',{message:error.message,code:500,layout:'error-layout'});
    }
  },

  getLogin: (req, res) => {
    try {
      if (req.session.user) {
        res.redirect('/')
      } else {
        res.render('user/login', { nav: true })
      }
    } catch (error) {

    }
  },

  postLogin: (req, res) => {
    try {
      userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
          req.session.user = response.user._id;
          res.send({ value: "SuccesSignin" })
        } else {
          res.send({ value: "failed" })
        }
      })

    } catch (error) {

    }
  },

  getLogout: async (req, res) => {
    try {

      req.session.user = await null
      res.redirect('/user_signin')

    } catch (error) {

    }
  },

  getOtp: (req, res) => {
    try {


      res.render('user/otpPage', { nav: true })
    } catch (error) {

    }
  },

  checkNumber: (req, res) => {
    try {


      console.log(req.body);
      let response = {}
      db.users.find({ contactNo: req.body.number }).then((resp) => {
        console.log(resp.length);
        if (resp.length != 0) {
          if (resp[0].status == true) {
            response.status = true //response sending for user not exist
            res.json(response)
          } else {
            response.blocked = true //blocked checking
            res.json(response)
          }
        } else {
          response.status = false
          res.json(response)
        }
      })
    } catch (error) {

    }
  },

  getOtplogin: (req, res) => {
    try {


      client
        .verify
        .services(otpConfig.serviceID)
        .verifications
        .create({
          to: `+${req.query.phoneNumber}`,
          channel: req.query.channel
        })
        .then((data) => {
          res.status(200).send(data)
        })
    } catch (error) {

    }
  },

  getOtpverify: (req, res) => {
    try {


      client
        .verify
        .services(otpConfig.serviceID)
        .verificationChecks
        .create({
          to: `+${req.query.phoneNumber}`,
          code: req.query.code
        })
        .then(async (data) => {
          userHelpers.getUser
          if (data.valid) {
            let number = data.to.slice(3);
            let userData = await db.users.findOne({ contactNo: number });
            req.session.user = userData._id;
            res.send({ value: "success" })
          } else {
            res.send({ value: 'failed' })
          }
        })
    } catch (error) {

    }
  },


  getAccounts: async (req, res) => {
    try {
      let user = req.user
      let countries = await db.country.find({}) 
      let address = await db.address.find({ user: req.session.user })
      let cartCount = await userHelpers.getCartCount(req.session.user)
      res.render('user/accounts', { cartCount, countries, address, user })
    } catch (error) {
      res.render('error',{message:error.message,code:500,layout:'error-layout'});
    }
  },

  addAddress: (req, res) => {
    try {


      console.log(req.body);
      userHelpers.addAddress(req.body, req.session.user).then(() => {
        res.json({ status: true })
      })
    } catch (error) {

    }
  },

  editAddress: (req, res) => {
    try {


      let addressId = req.params.id
      userHelpers.editAddress(req.body, addressId, req.session.user).then(() => {
        res.json({ status: true })

      })
    } catch (error) {

    }
  },

  deleteAddress: (req, res) => {
    try {

      let addressId = req.params.id
      console.log(addressId);
      userHelpers.deleteAddress(addressId, req.session.user).then(() => {
        res.json({ status: true })
      })

    } catch (error) {

    }
  },

  updateProfile: (req, res) => {
    try {

      let data = req.body
      userHelpers.updateProfile(data, req.session.user).then((response) => {
        res.json(response)
      })

    } catch (error) {

    }
  },

  getUserData: (req, res) => {
    try {

      userHelpers.getUserData(req.session.user).then((response) => {
        res.json(response)
      })

    } catch (error) {

    }
  },

  getShop: async (req, res) => {
    try {


      let user = req.user
      let cartCount = await userHelpers.getCartCount(req.session.user)
      products = await productHelpers.getAllproducts()
      res.render('user/category', { cartCount, products, user })
    } catch (error) {

    }
  },

  getcartProQty: async (req, res) => {
    try {


      console.log("hi");
      Qty = await userHelpers.getProQty(req.session.user, req.params.id)
      res.json(Qty)
    } catch (error) {

    }
  },

  getProduct: async (req, res) => {
    try {


      let user = req.user
      let id = req.params.id
      let cartCount = await userHelpers.getCartCount(req.session.user)
      products = await db.products.findOne({ _id: id })
      res.render('user/product', { cartCount, products, user })
    } catch (error) {

    }
  },

  getWishlist: (req, res) => {
    try {


      let user = req.user
      res.render('user/wishlist', { user })
    } catch (error) {

    }
  },

  getCart: async (req, res) => {
    try {


      let user = req.user
      let cartCount = await userHelpers.getCartCount(req.session.user)
      let total = await userHelpers.getTotalCount(req.session.user)
      userHelpers.getCartProducts(req.session.user).then((cartItems) => {
        res.render('user/cart', { total, cartCount, cartItems, user })

      })
    } catch (error) {

    }
  },

  addtoCart: (req, res) => {
    try {

      console.log('api call');
      userHelpers.addtoCart(req.params.id, req.session.user).then(() => {
        res.json({ status: true })
      })

    } catch (error) {

    }
  },

  changeProductQuantity: (req, res) => {
    try {


      userHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelpers.getTotalCount(req.session.user)
        res.json(response)
      })
    } catch (error) {

    }
  },

  deleteCartItems: (req, res) => {
    try {

      userHelpers.deleteCartItems(req.body).then((response) => {
        res.json(response)
      })

    } catch (error) {

    }
  },

  checkOut: async (req, res) => {
    try {

      let id = await db.order.find({ userId: req.session.user })
      let length = id[0]?.orders.length
      let orderId = id[0]?.orders[length - 1]._id;
      // console.log(req.body);
      let user = req.user
      let countries = await db.country.find({})
      let cartCount = await userHelpers.getCartCount(req.session.user)
      let total = await userHelpers.getTotalCount(req.session.user)
      let address = await db.address.find({ user: req.session.user })
      userHelpers.getCartProducts(req.session.user).then((cartItems) => {
        res.render('user/checkout', { orderId, paypalClientId: process.env.PAYPAL_CLIENT_ID, cartItems, total, user, cartCount, countries, address })
      })

    } catch (error) {

    }
  },

  checkOutPost: async (req, res) => {
    try {


      userHelpers.addressFind(req.params.id, req.session.user).then((data) => {
        res.json(data);
      })
    } catch (error) {

    }
  },


  placeOrder: async (req, res) => {
    try {
      req.body.userId = await req.session.user
      let total = await userHelpers.getTotalCount(req.session.user)
      console.log(couponPrice);
      total = total - couponPrice
      couponPrice = 0
      let totalPrice = total
      userHelpers.placeOrder(req.body, total).then((response) => {
        if (req.body.paymentMethod == "COD") {
          res.json({ codSuccess: true })
        } else if (req.body.paymentMethod == "Razorpay") {
          userHelpers.razorpay(total, req.session.user).then((response) => {
            res.json(response)
          })
        } else {
          console.log("heyyyyyy");
          let resp = {}
          resp.paypal = true,
            resp.total = totalPrice
          res.json(resp)
        }
      })

    } catch (error) {

    }
  },

  paypalOrder: async (req, res) => {
    try {
      console.log("paypalOrder");
      const request = new paypal.orders.OrdersCreateRequest()
      const total1 = await Convert(req.body.total).from("INR").to("USD");
      const total = await Math.floor(total1)
      request.prefer("return=representation")
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: total,
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: total,
                },
              },
            }
          },
        ],
      })

      try {
        const order = await paypalClient.execute(request)
        res.json({ id: order.result.id })
      } catch (e) {
        console.log("err", e);
        res.status(500).json({ error: e.message })
      }
    } catch (error) {

    }
  },




  verifyPayment: (req, res) => {
    try {


      userHelpers.verifyPayment(req.body).then((response) => {
        userHelpers.updatePaymentStatusRazorpay(req.body['order[receipt]']).then(() => {
          res.json(response)
        })
      }).catch((err) => {
        res.json({ status: false })
      })
    } catch (error) {

    }
  },

  verifyPaymentPaypal: async (req, res) => {
    try {

      userHelpers.updatePaymentStatusPaypal(req.session.user).then((response) => {
        res.json(response)
      })

    } catch (error) {

    }
  },

  orderDetails: async (req, res) => {
    try {


      let user = req.user
      let cartCount = await userHelpers.getCartCount(req.session.user)
      userHelpers.getOrderDetailsUser(req.session.user).then((orderDetails) => {
        res.render('user/order', { cartCount, orderDetails, user })
      }).catch(err => console.log(err))
    } catch (error) {

    }
  },

  OrdersCancel: (req, res) => {
    try {


      console.log(req.body);
      userHelpers.orderCancel(req.body, req.session.user).then((response) => {
        res.json(response)
      })
    } catch (error) {

    }
  },

  getOrderInvoice: (req, res) => {
    try {


      let proId = req.query.productId
      let orderId = req.query.orderId
      userHelpers.getOrderInvoice(proId, orderId).then((response) => {
        res.send(response)
      })
    } catch (error) {

    }
  },

  getSuccessPage: (req, res) => {
    try {


      res.render('user/successPage', { nav: true })
    } catch (error) {

    }
  },

  verifyCoupon: (req, res) => {
    try {
      let couponName = req.body.coupon
      couponHelpers.verifyCoupen(couponName, req.session.user).then((response) => {
        res.json(response)
      })
    } catch (error) {

    }
  },

  checkCoupon: (req, res) => {
    try {


      let coupenCheck = req.body.couponCheck
      couponHelpers.checkCoupon(coupenCheck, req.session.user).then((response) => {
        res.json(response)
      })
    } catch (error) {

    }
  },

  applyCoupon: async (req, res) => {
    try {

      let couponName = req.body.couponName
      let total = await userHelpers.getTotalCount(req.session.user)
      couponHelpers.applyCoupon(couponName, req.session.user, total).then((response) => {
        couponPrice = response.discountAmount
        res.json(response)

      })

    } catch (error) {

    }
  },

  returnProduct: (req, res) => {
    try {
      let obj = {
        proId: req.body.proId,
        orderId: req.body.orderId
      }
      userHelpers.returnProduct(obj, req.session.user).then((response) => {
        res.json(response)
      })

    } catch (error) {

    }
  },

  getAbout: async (req, res) => {
    try {

      let user = req.user
      let cartCount = await userHelpers.getCartCount(req.session.user)
      res.render('user/about', { user, cartCount })
    }
    catch (error) {

    }

  } 
}
