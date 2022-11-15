const userHelpers = require('../helpers/userHelpers')
const otpConfig = require('../helpers/otpHelpers')
const client = require('twilio')(otpConfig.accountSID, otpConfig.authToken);
const db = require('../Model/connection')
const productHelpers = require('../helpers/productHelpers');
const { response } = require('../app');


module.exports = {


  landingpage: async(req, res, next) => {
    let user = req.user
    let cartCount = await userHelpers.getCartCount(req.session.user)
      res.render('user/landingPage', { cartCount , user });
    

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

  checkNumber:(req,res)=>{
    console.log(req.body);
    let response = {}
    db.users.find({contactNo:req.body.number}).then((resp)=>{
      console.log(resp.length);
      if(resp.length!=0){
        if(resp[0].status==true){
          response.status=true //response sending for user not exist
          res.json(response)
        }else{
          response.blocked=true //blocked checking
          res.json(response)
        }
      }else{
        response.status=false
        res.json(response)
      }
    })
  },

  getOtplogin: (req, res) => {
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
          res.send({value:"success"})
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
    let cartCount = await userHelpers.getCartCount(req.session.user)
    products = await productHelpers.getAllproducts()
      res.render('user/category', {cartCount,products, user })
  },

  getProduct: async(req, res) => {
    let user = req.user
    let id = req.params.id
    let cartCount = await userHelpers.getCartCount(req.session.user)
    products = await db.products.findOne({_id:id})
    res.render('user/product', {cartCount,products, user })
  },

  getWishlist: (req, res) => {
    let user = req.user
    res.render('user/wishlist', { user })
  },

  getCart: async(req, res) => {
    let user = req.user
    let cartCount = await userHelpers.getCartCount(req.session.user)
    let total = await userHelpers.getTotalCount(req.session.user)
    userHelpers.getCartProducts(req.session.user).then((cartItems)=>{
      res.render('user/cart', {total,cartCount,cartItems, user })
    })
  },

  addtoCart:(req,res)=>{
    console.log('api call');
    userHelpers.addtoCart(req.params.id,req.session.user).then(()=>{
      res.json({status:true})
    })
  },

  changeProductQuantity:(req,res)=>{
    userHelpers.changeProductQuantity(req.body).then(async(response)=>{
      response.total = await userHelpers.getTotalCount(req.session.user)
      res.json(response)
    })
  },

  deleteCartItems:(req,res)=>{
    userHelpers.deleteCartItems(req.body).then((response)=>{
      res.json(response)
    })
  },

  checkOut:async(req,res)=>{
    // console.log(req.body);
    let user = req.user
    let countries = await db.country.find({})
    let cartCount = await userHelpers.getCartCount(req.session.user)
    let total = await userHelpers.getTotalCount(req.session.user)
    let address = await db.address.find({user:req.session.user})
    userHelpers.getCartProducts(req.session.user).then((cartItems)=>{
    res.render('user/checkout',{cartItems,total,user,cartCount,countries,address})
    })
  },

  checkOutPost:async(req,res)=>{
    userHelpers.addressFind(req.params.id,req.session.user).then((data)=>{
      console.log("checkOut =>",data);
      res.json(data);
  })
  },


  placeOrder:async(req,res)=>{
    req.body.userId = await req.session.user
    let total = await userHelpers.getTotalCount(req.session.user)
      userHelpers.placeOrder(req.body,total).then((response)=>{
      res.json(response)
    })
  },

  Orders:async (req,res)=>{
    let user = req.user
    let cartCount = await userHelpers.getCartCount(req.session.user)
    let orders =await userHelpers.getOrders(req.session.user)
    res.render('user/order',{orders,user,cartCount})
  },

  OrdersCancel:(req,res)=>{
    userHelpers.orderCancel(req.body,req.session.user).then((response)=>{
      res.json(response)
    })
  },

  getSuccessPage:(req,res)=>{
    res.render('user/successPage',{nav:true})
  },



  getAbout: async(req, res) => {
    let user = req.user
    let cartCount = await userHelpers.getCartCount(req.session.user)
    res.render('user/about', { user,cartCount })
  }
} 
