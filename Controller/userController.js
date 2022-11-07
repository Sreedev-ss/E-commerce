const userHelpers = require('../helpers/userHelpers')
const otpConfig = require('../helpers/otpHelpers')
const client = require('twilio')(otpConfig.accountSID, otpConfig.authToken);
const db = require('../Model/connection')
const productHelpers = require('../helpers/productHelpers')


module.exports = {


  landingpage: (req, res, next) => {
    let user = req.user
    console.log(user)
    res.render('user/landingPage', { user });
  },

  getSignup: (req, res) => {
    if (req.session.userSignnedIn) {
      res.redirect('/')
    } else {
      res.render('user/signup', { nav: true })
    }
  },

  postSignup: (req, res) => {
    console.log(req.body);
    userHelpers.doSignup(req.body).then((response) => {
      if (response.status) {
        req.session.user = response.user._id;

        res.send({ value: "Success" })
      } else {
        res.send({ value: 'anf' })
      }
    })
  },

  getLogin: (req, res) => {
    if (req.session.user) {
      res.redirect('/')
    } else {
      res.render('user/login', { nav: true })
    }
  },

  postLogin: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.user = response.user._id;
        res.send({ value: "SuccesSignin" })
      } else {
        res.send({ value: "failed" })
      }
    })
  },

  getLogout: (req, res) => {
    req.session.user = null
    res.redirect('/user_signin')
  },

  getOtp: (req, res) => {
    res.render('user/otpPage', { nav: true })
  },

  getOtplogin: (req, res) => {
    console.log(req.query);
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
  },

  getOtpverify: (req, res) => {
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
          res.send({ value: 'success' })
        } else {
          res.send({ value: 'failed' })
        }
      })
  },


  getAccounts: (req, res) => {
    let user = req.user
    res.render('user/accounts', { user })
  },

  getShop: async (req, res) => {
    let user = req.user
    products = await productHelpers.getAllproducts()
      res.render('user/category', {products, user })
  },

  getProduct: async(req, res) => {
    let user = req.user
    let id = req.params.id
    products = await db.products.findOne({_id:id})
    res.render('user/product', {products, user })
  },

  getWishlist: (req, res) => {
    let user = req.user
    res.render('user/wishlist', { user })
  },

  getCart: (req, res) => {
    let user = req.user
    res.render('user/cart', { user })
  },

  getAbout: (req, res) => {
    let user = req.user
    res.render('user/about', { user })
  }
} 
