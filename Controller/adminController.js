const productHelpers = require('../helpers/productHelpers')
const userHelpers = require('../helpers/userHelpers')
const adminHelpers = require('../helpers/adminHelpers')
const db = require('../Model/connection')
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




  //ADMIN PANEL -2

  getAdminPanel2: async (req, res) => {
    try {
      let admin2 = req.admin2
      if (admin2 == null) {
        res.redirect('/admin/login')
      }else{
      let products = await db.products.find({})
      adminHelpers.getrevenuebyMonth().then((price) => {
        adminHelpers.getorderCount().then(async(count) => {
          let year = new Date().getFullYear()
          let month = new Date().getMonth()+1
          let daily = await adminHelpers.getRevenuebyDay(month, year)
          let yearlyData = await adminHelpers.getRevenuebyYear(year)
          let priceData = price.arr[new Date().getMonth() + 1]
          res.render('admin-2/admin2landingpage', {yearlyData,daily,admin2,price, products, priceData, count, layout: data2.layout })
        }).catch(err => console.log(err))
      }).catch(err => console.log(err))
    }
    } catch (error) {

    }
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
    console.log("hi year", year);
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

  adminLogin: (req,res) => {
    try {
      res.render('admin-2/signup',{layout:data2.layout,nav:true})
    } catch (error) {

    }
  },

  getAdmin2logout:(req,res)=>{
    req.admin2 = null
    req.session.admin2 = null
    res.redirect("/admin/login")
  },

  postAdminlogin2: (req, res) => {
    console.log(req.body);
    adminHelpers.doAdminlogin(req.body).then((response) => {
      console.log(response.status);
      if (response.status) {
        req.session.admin2 = response.admin._id
        res.redirect('/admin')
      } else {
        res.redirect('/admin/login')
      }
    })
  },

  getProductManagement: async (req, res) => {
    try {
      let admin2 = req.admin2
      let products = await productHelpers.getAllproducts()
      res.render('admin-2/productManagement', {admin2, layout: data2.layout, products })
    } catch (error) {
      console.log(error);
    }
  },

  addproducts: async (req, res) => {
    let admin2 = req.admin2
    productHelpers.getCategory().then((category) => {
      res.render('admin-2/add-products', {admin2, category, layout: data2.layout })
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
    let admin2 = req.admin2
    let products = await productHelpers.getProductdetails(req.params.id)
    let category = await productHelpers.getCategory()
    res.render('admin-2/edit-products', {admin2, products, category, layout: data2.layout })
  },

  posteditProducts: (req, res) => {
    let imageName = req.params.id
    console.log(req.files);
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

      fs.unlink(`/productImages/${proId}`, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
        res.redirect('/admin/productManagement')
      }).catch(err => console.log(err))

    });

  },
  getcategoryManagement: async (req, res) => {
    try {
      let admin2 = req.admin2
      let category = await productHelpers.getCategory()
      res.render('admin-2/categoryManagement', {admin2, layout: data2.layout, category })
    } catch (error) {

    }
  },

  getaddCategory: (req, res) => {
    try {
      let admin2 = req.admin2
      res.render("admin-2/add-category", {admin2, layout: data2.layout })
    } catch (error) {

    }
  },

  postaddcategory: (req, res) => {
    try {
      let obj = {
        categories: req.body.categories,
        offer: req.body.offer
      }
      productHelpers.postaddCategory(obj).then((response) => {
        res.send(response)
      })
    } catch (error) {

    }
  },

  editCategory: async (req, res) => {
    try {
      let admin2 = req.admin2
      let id = req.params.id
      let category = await db.category.findOne({ _id: id })
      console.log(category);
      res.render('admin-2/edit-category', {admin2, category, layout: data2.layout })

    } catch (error) {

    }
  },

  posteditCategory: async (req, res) => {
    console.log(req.body);
    try {
      let id = req.params.id
      let obj = {
        categories: req.body.categories,
        offer: req.body.offer
      }

      productHelpers.editCategory(obj, id).then((response) => {
        res.send(response)
      })
    } catch (error) {

    }
  },

  deleteCategory: async (req, res) => {
    try {
      let id = req.params.id
      db.category.deleteOne({ _id: id }).then(() => {
        res.redirect('/admin/categoryManagement')
      }).catch(err => console.log(err))

    } catch (error) {

    }
  },


  getuserManagement: async (req, res) => {
    try {
      let admin2 = req.admin2
      let users = await userHelpers.getAllusers()
      res.render('admin-2/userManagement', {admin2, users, layout: data2.layout })
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

  getOrderPag: async (req, res) => {
    try {
      let admin2 = req.admin2
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
        res.render('admin-2/orderMangement', {admin2, page, data, orders, skip, limit, layout: data2.layout })
      }, 300)
    } catch (error) {
      console.log(error);
    }
  },

  getOrderDetils: async (req, res) => {
    let admin2 = req.admin2
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
      let admin2 = req.admin2
      let couponData = await db.coupen.find({})
      res.render('admin-2/coupenManagement', {admin2, couponData, layout: data2.layout })
    } catch (error) {
      console.log(error);
    }
  },

  getaddCoupon: (req, res) => {
    try {
      let admin2 = req.admin2
      res.render('admin-2/add-coupon', { admin2,layout: data2.layout })
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

  getBanner: async (req, res) => {
    try {
      let admin2 = req.admin2
      let banner = await db.banner.find({})
      res.render('admin-2/bannerManagement', {admin2, layout: data2.layout, banner })
    } catch (err) {
      console.log(err);
    }
  },

  addBanner: async (req, res) => {
    try {
      let admin2 = req.admin2
      let category = await db.category.find({})
      res.render('admin-2/add_banner', {admin2, layout: data2.layout, category })
    } catch (err) {
      console.log(err);
    }
  },

  postBanner: (req, res) => {
    try {
      let banner = JSON.parse(req.body.data)

      let obj = {
        title: banner.title,
        description: banner.description,
        category: banner.category
      }

      bannerHelpers.addBanner(obj).then((response) => {
        console.log(response);
        let bannerName = response
        let image = req.files.banner

        image.mv(`./public-admin/bannerImages/${bannerName}.jpg`, (err) => {
          if (!err) {
            res.send({ status: true })
          } else {
            console.log(err);
          }
        })
      }).catch(err => console.log(err));

      console.log(req.files, req.body?.data ? JSON.parse(req.body.data) : {});
      // res.send({status:true})
    }
    catch (err) {
      console.log(err);
    }
  },

  disableBanner: (req, res) => {
    try {
      let id = req.params.id
      bannerHelpers.disableBanner(id).then(() => {
        res.redirect('/admin/bannerManagement')
      }).catch(err => console.log(error))
    } catch (error) {

    }
  },

  enableBanner: (req, res) => {
    try {
      let id = req.params.id
      bannerHelpers.enableBanner(id).then(() => {
        res.redirect('/admin/bannerManagement')
      }).catch(err => console.log(err))
    } catch (error) {

    }
  },

  getadvBanner: async (req, res) => {
    try {
      let admin2 = req.admin2
      let advBanner = await db.advertisementBanner.find({})
      res.render('admin-2/advBanner', {admin2, advBanner, layout: data2.layout })
    } catch (error) {

    }
  },

  getadvBannerPage: async (req, res) => {
    try {
      let admin2 = req.admin2
      let category = await productHelpers.getCategory()
      res.render('admin-2/adv-banner', {admin2, category, layout: data2.layout })
    } catch (error) {

    }
  },

  postadvBanner: async (req, res) => {
    try {
      console.log(req.body, req.files.Image);
      let obj = {
        advBannerTitle: req.body.category,
        advBannerSpecify: req.body.description,
        category: req.body.category
      }
      bannerHelpers.advBanner(obj).then((response) => {
        let bannerName = response
        let image = req.files.Image

        image.mv(`./public-admin/ads-banner-images/${bannerName}.jpg`, (err) => {
          if (!err) {
            res.redirect('/admin')
          } else {
            console.log(err);
          }
        })
      })
    } catch (error) {
      // { category: 'mobiles', description: 'Best offers on mobiles' }
    }
  },



  // getAdsBann:async(req,res)=>{
  //   let adBanner = db.advertisementBanner.find({})

  // }



}