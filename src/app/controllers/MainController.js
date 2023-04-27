const Account = require('../model/Account');
const Cart = require('../model/Cart');
const Category = require('../model/Category');
const Customer = require('../model/Customer');
const Employee = require('../model/Employee');
const Order = require('../model/Order');
const OrderDetails = require('../model/OrderDetails');
const Payment = require('../model/Payment');
const Product = require('../model/Product');
const Supplier = require('../model/Supplier');

const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs');

class MainController {
  // [GET] /home
  home(req, res) {
    if (req.session.isAuth) {
      if (req.session.role == 2) {
        Product.find((err, array) => {
          if (!err) {
            console.log('========array', array);
            res.render('home', {
              array: array,
              accountId: req.session.accountId,
              username: req.session.username,
              role: req.session.role,
              userId: req.session.userId,
              avatar: req.session.avatar,
              fullname: req.session.fullname,
            });
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }).lean();
      } else {
        Product.find((err, array) => {
          if (!err) {
            console.log('========array', array);
            res.render('homeadmin', {
              array: array,
              accountId: req.session.accountId,
              username: req.session.username,
              role: req.session.role,
              userId: req.session.userId,
              avatar: req.session.avatar,
              fullname: req.session.fullname,
            });
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }).lean();
      }
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  // [GET] /home
  loginql(req, res) {
    res.render('login');
  }

  login(req, res) {
    console.log('=========body', req.body);
    Account.findOne({ username: req.body.username }, function (err, user) {
      if (!err) {
        if (user == null) {
          req.flash('error', 'Tên đăng nhập không đúng!');
          res.redirect('/quanly/login/');
        } else {
          if (bcrypt.compareSync(req.body.password, user.password)) {
            var sess = req.session;
            Employee.findOne(
              { idAccount: user.idAccount, status: 1 },
              (err, userInfo) => {
                if (!err) {
                  if (userInfo) {
                    sess.isAuth = true;
                    sess.role = user.role;
                    sess.username = user.username;
                    sess.accountId = user.id;
                    sess.userId = userInfo.idUser;
                    sess.avatar = userInfo.avatar;
                    sess.fullname = userInfo.name;
                    if (sess.back) {
                      res.redirect(sess.back);
                    } else {
                      if (req.session.role == 2) {
                        Product.find((err, array) => {
                          if (!err) {
                            console.log('========array', array);
                            res.render('home', {
                              array: array,
                              accountId: req.session.accountId,
                              username: req.session.username,
                              role: req.session.role,
                              userId: req.session.userId,
                              avatar: req.session.avatar,
                              fullname: req.session.fullname,
                            });
                          } else {
                            res.status(400).json({ error: 'ERROR!!!' });
                          }
                        }).lean();
                      } else {
                        Product.find((err, array) => {
                          if (!err) {
                            console.log('========array', array);
                            res.render('homeadmin', {
                              array: array,
                              accountId: req.session.accountId,
                              username: req.session.username,
                              role: req.session.role,
                              userId: req.session.userId,
                              avatar: req.session.avatar,
                              fullname: req.session.fullname,
                            });
                          } else {
                            res.status(400).json({ error: 'ERROR!!!' });
                          }
                        }).lean();
                      }
                    }
                  } else {
                    req.flash('error', 'Tài khoản chưa được kích hoạt!'); //nếu bắt user ko đúng sẽ trả dòng này
                    res.redirect('/quanly/login/');
                  }
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }
            ).lean();
          } else {
            req.flash('error', 'Mật khẩu không đúng!');
            res.redirect('/quanly/login/');
          }
        }
      } else {
        res.status(400).json({ error: 'ERROR!!!' });
      }
    });
  }

  //------DƯỢC SĨ
  quanlykhachhangds(req, res) {
    if (req.session.isAuth) {
      res.render('quanlykhachhangds', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/quanlykhachhang';
      res.redirect('/quanly/login/');
    }
  }

  quanlydonhangds(req, res) {
    if (req.session.isAuth) {
      res.render('quanlydonhangds', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/quanlydonhang';
      res.redirect('/quanly/login/');
    }
  }

  thongkeds(req, res) {
    if (req.session.isAuth) {
      res.render('thongkeds', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/thongke';
      res.redirect('/quanly/login/');
    }
  }
  //------ADMIN
  adminquanlythuoc(req, res) {
    if (req.session.isAuth) {
      res.render('adminquanlythuoc', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/quanlythuoc';
      res.redirect('/quanly/login/');
    }
  }

  adminquanlynhanvien(req, res) {
    if (req.session.isAuth) {
      res.render('adminquanlynhanvien', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/quanlynhanvien';
      res.redirect('/quanly/login/');
    }
  }

  adminquanlykhohang(req, res) {
    if (req.session.isAuth) {
      res.render('adminquanlykhohang', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/quanlykhohang';
      res.redirect('/quanly/login/');
    }
  }

  adminquanlydoanhthu(req, res) {
    if (req.session.isAuth) {
      res.render('adminquanlydoanhthu', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/quanlydoanhthu';
      res.redirect('/quanly/login/');
    }
  }

  adminquanlynhapkho(req, res) {
    if (req.session.isAuth) {
      res.render('adminquanlynhapkho', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/quanlynhapkho';
      res.redirect('/quanly/login/');
    }
  }

  //===========KHÁCH HÀNG===============

  homekh(req, res) {
    if (req.session.isAuth) {
      if (req.session.role == 1) {
        Category.find((err, danhmuc) => {
          if (!err) {
            if (danhmuc) {
              Product.find((err, array) => {
                if (!err) {
                  console.log('========array', array);
                  res.render('homekh', {
                    danhmuc: danhmuc,
                    array: array,
                    accountId: req.session.accountId,
                    username: req.session.username,
                    role: req.session.role,
                    userId: req.session.userId,
                    avatar: req.session.avatar,
                    fullname: req.session.fullname,
                  });
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }).lean();
            }
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }).lean();
      }
    } else {
      Category.find((err, danhmuc) => {
        if (!err) {
          console.log('========array', danhmuc);
          res.render('homekh', {
            danhmuc: danhmuc,
          });
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    }
  }

  // [GET] /home
  loginqlkh(req, res) {
    res.render('loginkh');
  }

  loginkh(req, res) {
    Account.findOne({ username: req.body.username }, function (err, user) {
      if (!err) {
        if (user == null) {
          req.flash('error', 'Tên đăng nhập không đúng!');
          res.redirect('/login/');
        } else {
          if (bcrypt.compareSync(req.body.password, user.password)) {
            var sess = req.session;
            Customer.findOne(
              { idAccount: user.idAccount, status: 1 },
              (err, userInfo) => {
                if (!err) {
                  if (userInfo) {
                    sess.isAuth = true;
                    sess.role = user.role;
                    sess.username = user.username;
                    sess.accountId = user.id;
                    sess.userId = userInfo.idUser;
                    sess.avatar = userInfo.avatar;
                    sess.fullname = userInfo.name;
                    if (sess.back) {
                      res.redirect(sess.back);
                    } else {
                      if (req.session.role == 1) {
                        Category.find((err, danhmuc) => {
                          if (!err) {
                            if (danhmuc) {
                              Product.find((err, array) => {
                                if (!err) {
                                  console.log('========array', array);
                                  res.render('homekh', {
                                    danhmuc: danhmuc,
                                    array: array,
                                    accountId: req.session.accountId,
                                    username: req.session.username,
                                    role: req.session.role,
                                    userId: req.session.userId,
                                    avatar: req.session.avatar,
                                    fullname: req.session.fullname,
                                  });
                                } else {
                                  res.status(400).json({ error: 'ERROR!!!' });
                                }
                              }).lean();
                            }
                          } else {
                            res.status(400).json({ error: 'ERROR!!!' });
                          }
                        }).lean();
                      }
                    }
                  } else {
                    req.flash('error', 'Tài khoản chưa được kích hoạt!'); //nếu bắt user ko đúng sẽ trả dòng này
                    res.redirect('/login/');
                  }
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }
            ).lean();
          } else {
            req.flash('error', 'Mật khẩu không đúng!');
            res.redirect('/login/');
          }
        }
      } else {
        res.status(400).json({ error: 'ERROR!!!' });
      }
    });
  }

  register(req, res) {
    res.render('register');
  }
}
module.exports = new MainController();
