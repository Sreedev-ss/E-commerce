const db = require('../Model/connection');

module.exports = {
    authInit: async (req, res, next) => {
        try {
            if (req.session?.user) {
                let userData = await db.users.findOne({ _id: req.session.user });
                if (userData.status == false) {
                    req.user = null;
                } else {
                    req.user = userData;
                };
            } else {
                req.user = null;
            };
        } catch (error) {
            console.log(error);
        }

        try {
            if (req.session?.admin) {
                let adminData = await db.admin.findOne({ _id: req.session.admin });
                if (adminData.status == false) {
                    req.admin = null;
                } else {
                    req.admin = adminData;
                };
            } else {
                req.admin = null;
            };
            next();
        } catch (error) {
            console.log(error);
        }
    },

    authInit2: async (req, res, next) => {
        try {
            if (req.session?.admin2) {
                let adminData2 = await db.admin.findOne({ _id: req.session.admin2 });
                
                    req.admin2 = adminData2;
                    // };
                    next();
            } else {
                req.admin2 = null;
                next();
            };
        } catch (error) {
            console.log(error);
        }
    
    },
    verifyUser: function (req, res, next) {
        try {
            if (req.user) {
                next();
            } else {
                res.redirect('/user_signin');
            }
        } catch (err) {
            console.log(err);
        }
    },
    verifyAdmin: function (req, res, next) {
        try {
            if (req.admin) {
                next();
            } else {
                res.redirect('/admin_panel/admin_login');
            }
        } catch (err) {
            console.log(err);
        }
    },
    verifyAdmin2:function(req,res,next){
        try {
            if (req.admin2) {
                next();
            } else {
                res.redirect('/admin/login');
            }
        } catch (err) {
            console.log(err);
        }
    },
    mustLogoutUser: function (req, res, next) {
        try {
            if (req.user) {
                res.redirect('/');
            } else {
                next();
            }
        } catch (err) {
            console.log(err);
        }
    },
    mustLogoutAdmin: (req, res, next) => {
        try {
            if (req.admin) {
                res.redirect('/admin_panel');
            } else {
                next();
            }
        } catch (err) {
            console.log(err);
        }
    },
    mustLogoutAdmin2: (req, res, next) => {
        try {
            if (req.admin2) {
                res.redirect('/admin');
            } else {
                next();
            }
        } catch (err) {
            console.log(err);
        }
    },

    verifyUserAPI: function (req, res, next) {
        try {
            if (req.user) {
                next();
            } else {
                res.status(401);
                res.send({ status: 'error', message: 'Unauthorized Action' });
            }
        } catch (err) {
            console.log(err);
        }
    },

    verifyAdminAPI: function (req, res, next) {
        try {
            if (req.admin) {
                next();
            } else {
                res.status(401);
                res.send({ status: 'error', message: 'Unauthorized Action' });
            }
        } catch (err) {
            console.log(err);
        }
    },

    mustLogoutAPI: function (req, res, next) {
        try {
            if (req.user) {
                res.send('Forbidden');
            } else {
                next();
            }
        } catch (err) {
            console.log(err);
        }
    },
};