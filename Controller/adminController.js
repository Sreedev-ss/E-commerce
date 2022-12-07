const productHelpers = require('../helpers/productHelpers')
const userHelpers = require('../helpers/userHelpers')
const adminHelpers = require('../helpers/adminHelpers')
const data = { layout: 'admin_layouts' }
const db = require('../Model/connection')
const { renderFile } = require('ejs')
const voucher_codes = require('voucher-code-generator');
const data2 = { layout: 'adminNew_layout' }
const couponHelpers = require('../helpers/couponHelpers')
const bannerHelpers = require('../helpers/BannerHelpers')

const XLSX = require('xlsx')



module.exports = {
  getExceldata: (req, res) => {
    try {
      let year = new Date().getFullYear()
      adminHelpers.getRevenuebyMonth1(year).then(async (response) => {
        console.log("hey xl");
        console.log(response);

        const Report = [];

        if (response?.length) {
          response.forEach(e => {
            const data = {};
            data['Month'] = e._id;
            data['Orders'] = e.orders;
            data['Revenue'] = e.totalCount;
            data['Quantity'] = e.totalQuantity;
            Report.push(data);
          });
        };

        const workSheet = await XLSX.utils.json_to_sheet(Report)

        const workBook = await XLSX.utils.book_new()


        XLSX.utils.book_append_sheet(workBook, workSheet, "Report")

        XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" })

        XLSX.write(workBook, { bookType: 'xlsx', type: "binary" })

        XLSX.writeFile(workBook, "Montly_Data.xlsx")

      }).catch(error => console.log(error))
      res.send({ status: true })

    } catch (error) {
      console.log(error);
    }


  },

  getAdminpanel: (req, res, next) => {
    try {

      let admin = req.admin
      if (admin == null) {
        res.redirect('/admin_panel/admin_login')
      } else {
        adminHelpers.getrevenuebyMonth().then(async (price) => {
          adminHelpers.getorderCount().then((count) => {
            let priceData = price.arr[new Date().getMonth() + 1]
            res.render('admin/admin_panel', { count, priceData, admin, layout: data.layout })
          })
        })
      }
    }
    catch (error) {
      res.render('error', { message: error.message, code: 500, layout: 'error-layout' });
    }

  },

  getheader: (req, res) => {
    let admin = req.admin
    res.render('user/admin_header', { admin, layout: data.layout })
  },

  getOrderdata: async (req, res) => {
    adminHelpers.getrevenuebyMonth().then((response) => {
      res.send(response)
    })
  },

  getOrderdataMontly: (req, res) => {
    console.log(req.query);
    let year = req.query.year
    adminHelpers.getRevenuebyMonth1(year).then((response) => {
      res.send(response)
    })
  },

  getOrderdataYearly: (req, res) => {
    let year = req.query.year
    adminHelpers.getRevenuebyYear(year).then((response) => {
      res.send(response)
    })
  },

  getDailydata: async (req, res) => {
    let month = req.query.month
    let year = req.query.year
    adminHelpers.getRevenuebyDay(month, year).then((response) => {
      res.send(response)
    })
  },

  getYealydata: (req, res) => {
    adminHelpers.getrevenueYearly().then((response) => {
      res.send(response)
    })
  },

  getPieData: (req, res) => {
    adminHelpers.getPayMethodCount().then((response) => {
      res.send(response)
    })
  },

  getAdminlogin: (req, res) => {
    res.render('admin/admin_login', data)
  },
  postAdminlogin: (req, res) => {
    adminHelpers.doAdminlogin(req.body).then((response) => {
      console.log(response.status);
      if (response.status) {
        req.session.admin = response.admin._id
        res.send({ admin: 'success' })
      } else {
        res.send({ admin: 'failed' })
      }
    })
  },

  getAdminlogout: (req, res) => {
    req.session.admin = null
    res.redirect("/admin_panel/admin_login")
  },


  getProduct: (req, res) => {
    let admin = req.admin
    productHelpers.getAllproducts().then((products) => {
      res.render('admin/productManagement', { admin, products, layout: data.layout })
    })

  },

  getAddproduct: async (req, res) => {
    let admin = req.admin
    productHelpers.getCategory().then((category) => {
      res.render('admin/add_products', { admin, category, layout: data.layout })
    })
  },

  postAddproduct: (req, res) => {
    console.log(req.body);
    productHelpers.addProducts(req.body).then((insertedId) => {
      console.log(insertedId)
      let imageName = insertedId
      console.log(req.files.Image);
      req.files.Image.forEach((element, index) => {
        element.mv('./public/productImages/' + imageName + index + '.jpg', (err) => {
          if (!err) {
            console.log('done');
          } else {
            console.log(err)
          }
        })

      });
      res.redirect('/admin_panel/products')


    })
  },

  getEditproduct: async (req, res) => {
    let admin = req.admin
    let products = await productHelpers.getProductdetails(req.params.id)
    productHelpers.getCategory().then((category) => {
      res.render('admin/edit_products', { admin, products, category, layout: data.layout })
    })
  },

  postEditproduct: async (req, res) => {
    let imageName = req.params.id
    await productHelpers.updateProduct(req.params.id, req.body).then(() => {
      req.files?.Image1?.mv('./public/productImages/' + imageName + '0.jpg')
      req.files?.Image2?.mv('./public/productImages/' + imageName + '1.jpg')
      req.files?.Image3?.mv('./public/productImages/' + imageName + '2.jpg')
      req.files?.Image4?.mv('./public/productImages/' + imageName + '3.jpg')
      res.redirect('/admin_panel/products')

    })
  },

  getDeleteproduct: (req, res) => {
    let proId = req.params.id
    productHelpers.deleteProduct(proId).then(() => {
      res.redirect('/admin_panel/products')
    })
  },

  getCategory: (req, res) => {
    let admin = req.admin
    productHelpers.getCategory().then((category) => {
      res.render('admin/categoryManagement', { admin, category, layout: data.layout })
    })
  },

  getAddcategory: (req, res) => {
    let admin = req.admin
    res.render('admin/add_category', data)
  },

  postAddcategory: (req, res) => {
    productHelpers.addCategory(req.body).then((response) => {
      if (response == false) {
        res.send({ value: "error" })
      } else {
        res.send({ value: 'nil' })
        // res.redirect('/admin_panel/category_management')
      }
    })
  },

  getEditcategory: async (req, res) => {
    let admin = req.admin
    let category = await productHelpers.getCategorydetails(req.params.id)
    res.render('admin/edit_category', { admin, category, layout: data.layout })
  },

  postEditcategory: (req, res) => {
    console.log(req.body);
    let catId = req.params.id
    productHelpers.updateCategory(catId, req.body).then(() => {
      res.send({ value: "Success" })
    })
  },

  getDeletecategory: (req, res) => {
    catId = req.params.id
    productHelpers.deleteCategory(catId).then(() => {
      res.redirect('/admin_panel/category_management')
    })
  },

  getUser: (req, res) => {
    let admin = req.admin
    userHelpers.getAllusers().then((users) => {
      res.render('admin/userManagement', { admin, users, layout: data.layout })
    })
  },

  getAdduser: (req, res) => {
    let admin = req.admin
    res.render('admin/add_users', { admin, layout: data.layout })
  },

  postAdduser: (req, res) => {
    userHelpers.addUser(req.body).then(() => {
      res.redirect('/admin_panel/user_management')
    })
  },

  getEdituser: async (req, res) => {
    let admin = req.admin
    let user = await userHelpers.getUserdetails(req.params.id)
    res.render('admin/edit_users', { admin, user, layout: data.layout })
  },

  postEdituser: (req, res) => {
    userHelpers.updateUser(req.params.id, req.body).then(() => {
      res.redirect('/admin_panel/user_management')
    })
  },

  getBlockuser: (req, res) => {
    let userId = req.params.id
    userHelpers.blockUser(userId).then(() => {
      res.redirect('/admin_panel/user_management')
    })
  },

  getUnblockuser: (req, res) => {
    let userId = req.params.id
    userHelpers.unblockUser(userId).then(() => {
      res.redirect('/admin_panel/user_management')
    })
  },

  orderManagement: async (req, res) => {
    let admin = req.admin
    let orders = await userHelpers.getAdminOrder()
    res.render('admin/orderManagement', { orders, admin, layout: data.layout })
  },

  orderDetails: async (req, res) => {
    let admin = req.admin
    let Id = req.params.id

    userHelpers.getOrderDetails(Id).then((orderDetails) => {
      res.render('admin/orderDetails', { orderDetails, admin, layout: data.layout })
    }).catch(err => console.log(err))
  },

  OrdersCancel: (req, res) => {
    console.log(req.body);
    userHelpers.orderCancel(req.body, req.session.user).then((response) => {
      res.json(response)
    })
  },


  updateOrder: (req, res) => {
    console.log("value", req.body)
    userHelpers.updateOrder(req.body, req.session.user).then((response) => {
      res.json(response)
    })
  },

  getCoupen: async (req, res) => {
    let admin = req.admin
    let couponData = await db.coupen.find({})
    res.render('admin/coupenManagement', { couponData, admin, layout: data.layout })
  },

  addCoupen: (req, res) => {
    let admin = req.admin
    productHelpers.getCategory().then((category) => {
      res.render('admin/add_coupen', { category, admin, layout: data.layout })
    })
  },

  generateCoupen: async (req, res) => {
    let coupenCode = await voucher_codes.generate({
      prefix: 'dMart-',
      length: 5,
      count: 1
    })
    res.send({ coupenCode })
  },

  coupenUpdate: (req, res) => {

    let obj = {
      coupon: req.body.coupen,
      discountType: req.body.discountType,
      amount: req.body.discountAmount,
      amountValidity: req.body.amountValidity,
      percentage: req.body.discountPercentage,
      validity: req.body.validity,
      description: req.body.description,
      redeemTime: req.body.redeemTime
    }
    console.log("obj=>", obj);
    couponHelpers.addCoupon(obj).then((response) => {
      res.json(response)
    })
  },



  //ADMIN PANEL -2

  getAdminPanel2: (req, res) => {
    adminHelpers.getrevenuebyMonth().then(async (price) => {
      adminHelpers.getorderCount().then((count) => {
        let priceData = price.arr[new Date().getMonth() + 1]
        res.render('admin-2/admin2landingpage', { priceData, count, layout: data2.layout })
      })
    })
  },

  getProductManagement: async (req, res) => {
    try {
      let products = await productHelpers.getAllproducts()
      res.render('admin-2/productManagement', { layout: data2.layout, products })
    } catch (error) {
      console.log(error);
    }
  },

  addproducts: async (req, res) => {
    productHelpers.getCategory().then((category) => {
      res.render('admin-2/add-products', { category, layout: data2.layout })
    })
  },

  postAddProducts: async (req, res) => {
    productHelpers.addProducts(req.body).then((insertedId) => {
      console.log(insertedId)
      let imageName = insertedId
      console.log(req.files.Image);
      req.files.Image.forEach((element, index) => {
        element.mv('./public/productImages/' + imageName + index + '.jpg', (err) => {
          if (!err) {
            console.log('done');
          } else {
            console.log(err)
          }
        })
      });
      res.redirect('/admin/productManagement')
    }).catch(err => console.log(err));
  },

  editproduct: async (req, res) => {
    let products = await productHelpers.getProductdetails(req.params.id)
    let category = await productHelpers.getCategory()
    res.render('admin-2/edit-products', { products, category, layout: data2.layout })
  },

  posteditProducts: (req, res) => {
    let imageName = req.params.id
    productHelpers.updateProduct(req.params.id, req.body).then(() => {
      req.files?.Image1?.mv('./public/productImages/' + imageName + '0.jpg')
      req.files?.Image2?.mv('./public/productImages/' + imageName + '1.jpg')
      req.files?.Image3?.mv('./public/productImages/' + imageName + '2.jpg')
      req.files?.Image4?.mv('./public/productImages/' + imageName + '3.jpg')
      res.redirect('/admin/productManagement')

    })
  },

  deleteProduct: (req, res) => {
    let proId = req.params.id
    productHelpers.deleteProduct(proId).then(() => {
      res.redirect('/admin/productManagement')
    }).catch(err => console.log(err))
  },
  getcategoryManagement: async (req, res) => {
    try {
      let category = await productHelpers.getCategory()
      res.render('admin-2/categoryManagement', { layout: data2.layout, category })
    } catch (error) {

    }
  },

  getuserManagement: async (req, res) => {
    try {
      let users = await userHelpers.getAllusers()
      res.render('admin-2/userManagement', { users, layout: data2.layout })
    } catch (error) {

    }
  },

  BlockUser: (req, res) => {
    let userId = req.params.id
    userHelpers.blockUser(userId).then(() => {
      res.redirect('/admin/userManagement')
    })
  },

  UnblockUser: (req, res) => {
    let userId = req.params.id
    userHelpers.unblockUser(userId).then(() => {
      res.redirect('/admin/userManagement')
    })
  },

  // getorderMangement: async (req, res) => {
  //   try {
  //     let orders = await userHelpers.getAdminOrder()
  //     res.render('admin-2/orderMangement', { orders, layout: data2.layout })
  //   } catch (error) {

  //   }
  // },

  getOrderPag: async (req, res) => {
    try {
      console.log(req.query);
      let skip = req.query.skip
      let limit = req.query.limit
      let page = req.query.page
      let orders = await userHelpers.getAdminOrderPag(parseInt(skip), parseInt(limit))
      skip = parseInt(skip)
      let orderData = (await db.order.find({}))
      let data = null
      for (i = 0; i < orderData.length; i++) {
        data += orderData[i].orders.length
      }
      console.log(data);
      setTimeout(() => {
        res.render('admin-2/orderMangement', { page, data, orders, skip, limit, layout: data2.layout })
      }, 300)
    } catch (error) {
      console.log(error);
    }
  },

  getOrderDetils: async (req, res) => {
    let Id = req.params.id
    userHelpers.getOrderDetails(Id).then((orderDetails) => {
      res.render('admin-2/orderDetails', { orderDetails, layout: data2.layout })
    }).catch(err => console.log(err))
  },

  CancelOrder: (req, res) => {
    userHelpers.orderCancel(req.body, req.session?.user).then((response) => {
      res.json(response)
    }).catch(err => console.log(err))
  },

  updateOrderDetails: (req, res) => {
    userHelpers.updateOrder(req.body, req.session.user).then((response) => {
      res.json(response)
    }).catch(err => console.log(err))
  },

  getcouponManagement: async (req, res) => {
    try {
      let couponData = await db.coupen.find({})
      res.render('admin-2/coupenManagement', { couponData, layout: data2.layout })
    } catch (error) {
      console.log(error);
    }
  },

  getaddCoupon: (req, res) => {
    try {
      res.render('admin-2/add-coupon', { layout: data2.layout })
    } catch (error) {
      console.log(error);
    }
  },

  postaddCoupon: (req, res) => {
    try {
      let obj = {
        coupon: req.body.coupen,
        discountType: req.body.discountType,
        cappedAmount: req.body.cappedAmount,
        amount: req.body.discountAmount,
        amountValidity: req.body.amountValidity,
        percentage: req.body.discountPercentage,
        validity: req.body.validity,
        description: req.body.description,
        redeemTime: req.body.redeemTime
      }
      console.log("obj=>", obj);
      couponHelpers.addCoupon(obj).then((response) => {
        res.json(response)
      }).catch(err => console.log(err))
    } catch (error) {
      console.log(error)
    }
  },

  getCoupenCode: async (req, res) => {
    try {
      let coupenCode = await voucher_codes.generate({
        prefix: 'dMart-',
        length: 5,
        count: 1
      })
      res.send({ coupenCode })
    } catch (error) {
      console.log(error);
    }

  },

  getBanner:async(req,res)=>{
    try{
     let banner = await db.banner.find({})
      res.render('admin-2/bannerManagement',{layout:data2.layout,banner})
    }catch(err){
      console.log(err);
    }
  },

  addBanner:async(req,res)=>{
    try{
      let category = await db.category.find({})
      res.render('admin-2/add_banner',{layout:data2.layout,category})
    }catch(err){
      console.log(err);
    }
  },
 
  postBanner:(req,res)=>{
    try{
      let banner = JSON.parse(req.body.data)

      let obj ={
        title : banner.title,
        description : banner.description,
        category:banner.category
      }

      bannerHelpers.addBanner(obj).then((response)=>{
       console.log(response);
       let bannerName = response
       let image = req.files.banner

       image.mv(`./public-admin/bannerImages/${bannerName}.jpg`,(err)=>{
        if(!err){
          res.send({status:true})
        }else{
          console.log(err);
        }
       })
      }).catch(err=>console.log(err));

      console.log(req.files,req.body?.data?JSON.parse(req.body.data):{});
      // res.send({status:true})
    }
    catch(err){
      console.log(err);
    }
  },

  disableBanner:(req,res)=>{
    let id = req.params.id
    bannerHelpers.disableBanner(id).then(()=>{
      res.redirect('/admin/bannerManagement')
    })
  },

  enableBanner:(req,res)=>{
    let id = req.params.id
    bannerHelpers.enableBanner(id).then(()=>{
      res.redirect('/admin/bannerManagement')
    })
  },




}