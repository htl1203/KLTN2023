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
const ProductCart = require('../model/ProductCart');

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
    var numberCart = 0;
    if (req.session.isAuth) {
      if (req.session.role == 1) {
        Category.find((err, danhmuc) => {
          if (!err) {
            if (danhmuc) {
              Product.find((err, array) => {
                if (!err) {
                  Cart.find(
                    {
                      idCustomer: req.session.userId,
                    },
                    (err, listCart) => {
                      if (!err) {
                        if (listCart) {
                          for (var i = 0; i < listCart.length; i++) {
                            numberCart += listCart[i].quality;
                          }
                        } else {
                          numberCart = 0;
                        }
                        res.render('homekh', {
                          numberCart: numberCart,
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
                    }
                  ).lean();
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
          if (danhmuc) {
            Product.find((err, array) => {
              if (!err) {
                res.render('homekh', {
                  danhmuc: danhmuc,
                  array: array,
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

  // [GET] /home
  loginqlkh(req, res) {
    res.render('loginkh');
  }

  loginkh(req, res) {
    var numberCart = 0;
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
                    sess.userId = userInfo.idCustomer;
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
                                  Cart.find(
                                    {
                                      idCustomer: req.session.userId,
                                    },
                                    (err, listCart) => {
                                      if (!err) {
                                        if (listCart) {
                                          for (
                                            var i = 0;
                                            i < listCart.length;
                                            i++
                                          ) {
                                            numberCart += listCart[i].quality;
                                          }
                                        } else {
                                          numberCart = 0;
                                        }
                                        res.render('homekh', {
                                          numberCart: numberCart,
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
                                        res
                                          .status(400)
                                          .json({ error: 'ERROR!!!' });
                                      }
                                    }
                                  ).lean();
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

  // [GET] /chitietsanpham/:idProduct
  chitietsanphamkh(req, res, next) {
    var numberCart = 0;
    if (req.session.isAuth) {
      Product.findOne(
        { idProduct: Number(req.params.idProduct) },
        (err, data) => {
          if (!err) {
            Category.findOne(
              { idCategory: data.idCategory },
              (err, category) => {
                if (!err) {
                  Cart.find(
                    {
                      idCustomer: req.session.userId,
                    },
                    (err, listCart) => {
                      if (!err) {
                        if (listCart) {
                          for (var i = 0; i < listCart.length; i++) {
                            numberCart += listCart[i].quality;
                          }
                        } else {
                          numberCart = 0;
                        }
                        res.render('chitietsanphamkh', {
                          numberCart: numberCart,
                          data: data,
                          category: category,
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
                    }
                  ).lean();
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }
            ).lean();
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      Product.findOne(
        { idProduct: Number(req.params.idProduct) },
        (err, data) => {
          if (!err) {
            Category.findOne(
              { idCategory: data.idCategory },
              (err, category) => {
                if (!err) {
                  res.render('chitietsanphamkh', {
                    data: data,
                    category: category,
                  });
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }
            ).lean();
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    }
  }

  // [POST] /themgiohang
  themgiohangkh(req, res, next) {
    req.body.idCustomer = req.session.userId;
    const cart = new Cart(req.body);
    if (req.session.isAuth) {
      Cart.findOne(
        { idProduct: req.body.idProduct, idCustomer: req.body.idCustomer },
        (err, isCart) => {
          if (!err) {
            if (isCart) {
              Cart.updateOne(
                { idCart: isCart.idCart },
                { quality: isCart.quality + 1 }
              )
                .then(() => {
                  req.flash('success', 'Thêm vào giỏ hàng thành công!');
                  res.redirect('/home');
                })
                .catch(error => {});
            } else {
              cart
                .save()
                .then(() => {
                  req.flash('success', 'Thêm vào giỏ hàng thành công!');
                  res.redirect('/home');
                })
                .catch(error => {});
            }
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  // [GET] /giohang
  giohangkh(req, res, next) {
    var sumPrice = 0;
    const array = [];
    const listCartNew = [];
    var numberCart = 0;
    if (req.session.isAuth) {
      Cart.find(
        {
          idCustomer: req.session.userId,
        },
        (err, listCart) => {
          if (!err) {
            if (listCart) {
              for (var i = 0; i < listCart.length; i++) {
                numberCart += listCart[i].quality;
                const productCart = new ProductCart();
                productCart.idProductCart = listCart[i].idProduct;
                productCart.idCart = listCart[i].idCart;
                productCart.qualityCart = listCart[i].quality;
                productCart.idCustomer = listCart[i].idCustomer;
                productCart.orderDate = listCart[i].orderDate;
                productCart.statusCart = listCart[i].status;

                Product.findOne(
                  { idProduct: listCart[i].idProduct },
                  (err, pro) => {
                    if (!err) {
                      listCartNew.push(pro);
                      productCart.name = pro.name;
                      productCart.idCategory = pro.idCategory;
                      productCart.idSupplier = pro.idSupplier;
                      productCart.dateAdded = pro.dateAdded;
                      productCart.manufacturingDate = pro.manufacturingDate;
                      productCart.expiryDate = pro.expiryDate;
                      productCart.imageList = pro.imageList;
                      productCart.importPrice = pro.importPrice;
                      productCart.salePrice = pro.salePrice;
                      productCart.format = pro.format;
                      productCart.packingForm = pro.packingForm;
                      productCart.uses = pro.uses;
                      productCart.component = pro.component;
                      productCart.specified = pro.specified;
                      productCart.antiDefinition = pro.antiDefinition;
                      productCart.dosage = pro.dosage;
                      productCart.sideEffects = pro.sideEffects;
                      productCart.careful = pro.careful;
                      productCart.preserve = pro.preserve;
                      productCart.trademark = pro.trademark;
                      productCart.origin = pro.origin;
                      productCart.quality = pro.quality;
                      productCart.retailQuantity = pro.retailQuantity;
                      productCart.quantityPerBox = pro.quantityPerBox;
                      productCart.status = pro.status;
                      sumPrice += pro.salePrice * productCart.qualityCart;
                      array.push(productCart);

                      if (listCartNew.length == listCart.length) {
                        res.render('giohangkh', {
                          numberCart: numberCart,
                          array: array,
                          sumPrice: sumPrice,
                          accountId: req.session.accountId,
                          username: req.session.username,
                          role: req.session.role,
                          userId: req.session.userId,
                          avatar: req.session.avatar,
                          fullname: req.session.fullname,
                        });
                      }
                    } else {
                      res.status(400).json({ error: 'ERROR!!!' });
                    }
                  }
                ).lean();
              }
            } else {
              numberCart = 0;
            }
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }
}
module.exports = new MainController();
