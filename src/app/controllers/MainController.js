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
const ProductTemp = require('../model/ProductTemps');
const Receipt = require('../model/Receipt');
const ReceiptTemps = require('../model/ReceiptTemps');
const ProductNoti = require('../model/ProductNoti');
const OrderTemp = require('../model/OrderTemp');
const PaymentTemp = require('../model/PaymentTemp');
const EmailOTP = require('../model/EmailOTP');

const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs');
var moment = require('moment');
const nodemailer = require('nodemailer');
class MainController {
  // [GET] /home
  home(req, res) {
    var countExpired = 0;
    if (req.session.isAuth) {
      if (req.session.role == 2) {
        Product.find((err, array) => {
          if (!err) {
            res.render('home', {
              array: array,
              sumProduct: array.length,
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
            for (var i = 0; i < array.length; i++) {
              var date1 = new Date(); // current date
              var date2 = new Date(array[i].expiryDate); // mm/dd/yyyy format
              var timeDiff = Math.abs(date2.getTime() - date1.getTime()); // in miliseconds
              var timeDiffInSecond = Math.ceil(timeDiff / (24 * 3600 * 1000));
              if (Number(timeDiffInSecond) <= 15) {
                countExpired = countExpired + 1;
              }
            }
            res.render('homeadmin', {
              countExpired: countExpired,
              array: array,
              sumProduct: array.length,
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
    var text = '123';
    console.log('123--', Number(text));
    var countExpired = 0;
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
                    sess.accountId = user.idAccount;
                    sess.userId = userInfo.idEmployee;
                    sess.avatar = userInfo.avatar;
                    sess.fullname = userInfo.name;
                    if (sess.back) {
                      res.redirect(sess.back);
                    } else {
                      if (req.session.role == 2) {
                        Product.find((err, array) => {
                          if (!err) {
                            res.render('home', {
                              array: array,
                              sumProduct: array.length,
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
                      } else if (req.session.role == 3) {
                        Product.find((err, array) => {
                          if (!err) {
                            for (var i = 0; i < array.length; i++) {
                              var date1 = new Date(); // current date
                              var date2 = new Date(array[i].expiryDate); // mm/dd/yyyy format
                              var timeDiff = Math.abs(
                                date2.getTime() - date1.getTime()
                              ); // in miliseconds
                              var timeDiffInSecond = Math.ceil(
                                timeDiff / (24 * 3600 * 1000)
                              );
                              if (Number(timeDiffInSecond) <= 15) {
                                countExpired = countExpired + 1;
                              }
                            }
                            res.render('homeadmin', {
                              countExpired: countExpired,
                              array: array,
                              sumProduct: array.length,
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
  taodonhangds(req, res) {
    const arrayNew = [];
    var sumPrice = 0;
    var sumQuality = 0;
    if (req.session.isAuth) {
      Order.find(
        {
          idEmployee: req.session.userId,
          status: 1,
        },
        (err, listOrder) => {
          if (listOrder) {
            sumQuality = listOrder.length;
            for (var i = 0; i < listOrder.length; i++) {
              sumPrice += listOrder[i].salePrice * listOrder[i].quality;

              console.log('=========sumPrice', sumPrice);
              const orderTemp = new OrderTemp();
              orderTemp.idOrderTemp = listOrder[i].idOrder;
              orderTemp.idEmployee = listOrder[i].idEmployee;
              orderTemp.idProduct = listOrder[i].idProduct;
              orderTemp.quality = listOrder[i].quality;
              orderTemp.salePrice = listOrder[i].salePrice;
              orderTemp.orderDate = listOrder[i].orderDate;
              orderTemp.status = listOrder[i].status;
              orderTemp.createdAt = listOrder[i].createdAt;
              orderTemp.updatedAt = listOrder[i].updatedAt;
              Product.findOne(
                { idProduct: listOrder[i].idProduct },
                (err, pro) => {
                  if (!err) {
                    orderTemp.nameProduct = pro.name;
                    arrayNew.push(orderTemp);
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }
              ).lean();
            }
          } else {
            sumPrice = 0;
          }
          if (!err) {
            Product.find((err, array) => {
              if (!err) {
                var dateNow = new Date();
                var h = dateNow.getHours();
                var m = dateNow.getMinutes();
                if (h <= 9) h = '0' + h;
                if (m <= 9) m = '0' + m;
                res.render('taodonhang', {
                  dateNow: dateNow,
                  h: h,
                  m: m,
                  array: array,
                  arrayNew: arrayNew,
                  sumPrice: sumPrice,
                  sumQuality: sumQuality,
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
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  taodonhangchitietds(req, res) {
    const arrayNew = [];
    var sumPrice = 0;
    var sumQuality = 0;
    if (req.session.isAuth) {
      Order.find(
        {
          idEmployee: req.session.userId,
          status: 1,
        },
        (err, listOrder) => {
          if (listOrder) {
            sumQuality = listOrder.length;
            for (var i = 0; i < listOrder.length; i++) {
              sumPrice += listOrder[i].salePrice * listOrder[i].quality;

              console.log('=========sumPrice', sumPrice);
              const orderTemp = new OrderTemp();
              orderTemp.idOrderTemp = listOrder[i].idOrder;
              orderTemp.idEmployee = listOrder[i].idEmployee;
              orderTemp.idProduct = listOrder[i].idProduct;
              orderTemp.quality = listOrder[i].quality;
              orderTemp.salePrice = listOrder[i].salePrice;
              orderTemp.orderDate = listOrder[i].orderDate;
              orderTemp.status = listOrder[i].status;
              orderTemp.createdAt = listOrder[i].createdAt;
              orderTemp.updatedAt = listOrder[i].updatedAt;
              Product.findOne(
                { idProduct: listOrder[i].idProduct },
                (err, pro) => {
                  if (!err) {
                    orderTemp.nameProduct = pro.name;
                    arrayNew.push(orderTemp);
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }
              ).lean();
            }
          } else {
            sumPrice = 0;
          }
          if (!err) {
            Product.find((err, array) => {
              if (!err) {
                var dateNow = new Date();
                var h = dateNow.getHours();
                var m = dateNow.getMinutes();
                if (h <= 9) h = '0' + h;
                if (m <= 9) m = '0' + m;
                res.render('taodonhangchitiet', {
                  dateNow: dateNow,
                  h: h,
                  m: m,
                  array: array,
                  arrayNew: arrayNew,
                  sumPrice: sumPrice,
                  sumQuality: sumQuality,
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
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  laydonhangds(req, res) {
    const array = [];
    if (req.session.isAuth) {
      for (var i = 0; i < req.body.soluong.length; i++) {
        if (req.body.soluong[i]) {
          const order = new Order();
          order.idEmployee = req.session.userId;
          order.idProduct = req.body.idProduct[i];
          order.quality = req.body.soluong[i];
          order.salePrice = req.body.salePrice[i];
          order.status = 1;
          array.push(order);
        }
      }
      for (var i = 0; i < array.length; i++) {
        const newOrder = new Order();
        newOrder.idEmployee = array[i].idEmployee;
        newOrder.idProduct = array[i].idProduct;
        newOrder.quality = array[i].quality;
        newOrder.salePrice = array[i].salePrice;
        newOrder.orderDate = array[i].orderDate;
        newOrder.status = array[i].status;
        newOrder.createdAt = array[i].createdAt;
        newOrder.updatedAt = array[i].updatedAt;

        newOrder
          .save()
          .then(() => {
            if (i == array.length) res.redirect('/quanly/taodonhang');
          })
          .catch(error => {});
      }
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  thanhtoands(req, res) {
    var sumPrice = 0;
    const array = [];
    const arrayPro = [];
    const arrayProQua = [];
    var sumQuality = 0;
    if (req.session.isAuth) {
      Order.find(
        {
          idEmployee: req.session.userId,
          status: 1,
        },
        (err, listOrder) => {
          if (!err) {
            if (listOrder.length > 0) {
              for (var i = 0; i < listOrder.length; i++) {
                sumPrice += listOrder[i].salePrice * listOrder[i].quality;
                sumQuality = listOrder.length;
                array.push(listOrder[i].idOrder);
                arrayPro.push(listOrder[i].idProduct);
                arrayProQua.push(listOrder[i].quality);
              }
              for (var i = 0; i < arrayPro.length; i++) {
                var qualityNew = 0;
                qualityNew = arrayProQua[i];

                Product.findOne({ idProduct: arrayPro[i] }, (err, array) => {
                  if (!err) {
                    var sold = 0;
                    sold = array.sold + qualityNew;
                    Product.updateOne(
                      { idProduct: array.idProduct },
                      { sold: sold }
                    )
                      .then(() => {
                        console.log('TRUEEE');
                      })
                      .catch(err => {});
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }).lean();
              }

              const orderDetails = new OrderDetails();
              orderDetails.idOrder = array;
              orderDetails.totalMoney = sumPrice;
              orderDetails.totalQuality = sumQuality;
              orderDetails.paymentType = 'Tiền mặt';
              orderDetails.status = 1;

              orderDetails
                .save()
                .then(() => {
                  for (var i = 0; i < array.length; i++) {
                    Order.updateOne(
                      {
                        idOrder: array[i],
                      },
                      { status: 0 }
                    )
                      .then(() => {
                        if (i == array.length) {
                          req.flash('success', 'Thanh toán thành công!');
                          res.redirect('/quanly/taodonhang');
                        }
                      })
                      .catch(err => {});
                  }
                })
                .catch(error => {});
            } else {
              req.flash('error', 'Chưa chọn sản phẩm thanh toán!');
              res.redirect('/quanly/taodonhang');
            }
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  quanlykhachhangds(req, res) {
    if (req.session.isAuth) {
      Customer.find((err, array) => {
        if (!err) {
          res.render('quanlykhachhangds', {
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  quanlydonhangds(req, res) {
    if (req.session.isAuth) {
      OrderDetails.find((err, array) => {
        if (!err) {
          if (array.length > 0) {
            array.sort(function (a, b) {
              return b.time - a.time;
            });
          }
          res.render('quanlydonhangds', {
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  quanlyxemchitietdonhangds(req, res) {
    var listIdOrder = [];
    var listOrder = [];
    var listOrderTemp = [];
    var idEmployee;
    if (req.session.isAuth) {
      OrderDetails.findOne(
        { idOrderDetail: Number(req.params.idOrderDetail) },
        (err, orderDetail) => {
          if (!err) {
            if (orderDetail) {
              listIdOrder = orderDetail.idOrder;
              for (var i = 0; i < listIdOrder.length; i++) {
                Order.findOne(
                  {
                    idOrder: Number(listIdOrder[i]),
                  },
                  (err, order) => {
                    if (!err) {
                      if (order) {
                        idEmployee = order.idEmployee;
                        console.log('TEST-------idEmployee', idEmployee, i);
                        listOrder.push(order);
                        if (i == listIdOrder.length) {
                          if (listOrder.length > 0) {
                            console.log(
                              'TEST-------listOrder',
                              listOrder.length
                            );
                            for (var j = 0; j < listOrder.length; j++) {
                              const orderTemp = new OrderTemp();
                              orderTemp.idOrderTemp = listOrder[j].idOrder;
                              orderTemp.idEmployee = listOrder[j].idEmployee;
                              orderTemp.idProduct = listOrder[j].idProduct;
                              orderTemp.quality = listOrder[j].quality;
                              orderTemp.salePrice = listOrder[j].salePrice;
                              orderTemp.orderDate = listOrder[j].orderDate;
                              orderTemp.status = listOrder[j].status;
                              orderTemp.createdAt = listOrder[j].createdAt;
                              orderTemp.updatedAt = listOrder[j].updatedAt;
                              Product.findOne(
                                { idProduct: listOrder[j].idProduct },
                                (err, pro) => {
                                  if (!err) {
                                    orderTemp.nameProduct = pro.name;
                                    orderTemp.imageProduct = pro.imageList;
                                    orderTemp.packingForm = pro.packingForm;
                                    listOrderTemp.push(orderTemp);
                                    if (j == listOrder.length) {
                                      res.render('quanlyxemchitietdonhangds', {
                                        idOrderDetail: req.params.idOrderDetail,
                                        orderDetail: orderDetail,
                                        listOrderTemp: listOrderTemp,
                                        idEmployee: idEmployee,
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
                          }
                        }
                      }
                    } else {
                      res.status(400).json({ error: 'ERROR!!!' });
                    }
                  }
                ).lean();
              }
            }
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  thongkeds(req, res) {
    if (req.session.isAuth) {
      Product.find((err, array) => {
        if (!err) {
          res.render('thongkeds', {
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  xemthongtincanhands(req, res) {
    console.log('req.session.userId', req.session.userId);
    if (req.session.isAuth) {
      Employee.findOne({ idEmployee: req.session.userId }, (err, array) => {
        if (!err) {
          console.log('array', array);
          res.render('xemthongtincanhands', {
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  loaddoimatkhau(req, res) {
    if (req.session.isAuth) {
      res.render('doimatkhau', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  doimatkhau(req, res) {
    Account.findOne(
      { idAccount: Number(req.params.accountId) },
      function (err, acc) {
        if (!err) {
          if (acc) {
            if (bcrypt.compareSync(req.body.oldpassword, acc.password)) {
              if (req.body.newpassword.length < 8) {
                req.flash('error', 'Mật khẩu phải từ 8 ký tự!');
                res.redirect('/quanly/doimatkhau');
              } else {
                if (req.body.newpassword == req.body.renewpassword) {
                  bcrypt.hash(req.body.newpassword, 10, function (error, hash) {
                    if (error) {
                      return next(error);
                    } else {
                      if (hash) {
                        console.log('=========hash', hash);
                        req.body.newpassword = hash;
                        console.log('=========hash', req.body.newpassword);

                        if (req.session.isAuth) {
                          Account.updateOne(
                            { idAccount: Number(req.params.accountId) },
                            { password: hash }
                          )
                            .then(() => {
                              req.flash('success', 'Thành công!');
                              res.redirect('/quanly/home');
                            })
                            .catch(err => {
                              console.log('=========err', err);
                            });
                        } else {
                          req.session.back = '/home';
                          res.redirect('/quanly/login/');
                        }
                      }
                    }
                  });
                } else {
                  req.flash('error', 'Mật khẩu nhập lại không trùng!');
                  res.redirect('/quanly/doimatkhau');
                }
              }
            } else {
              req.flash('error', 'Mật khẩu cũ không đúng!');
              res.redirect('/quanly/doimatkhau');
            }
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }
    );
  }

  //------ADMIN
  adminquanlythuoc(req, res) {
    var countExpired = 0;
    if (req.session.isAuth) {
      Product.find((err, array) => {
        if (!err) {
          for (var i = 0; i < array.length; i++) {
            var date1 = new Date(); // current date
            var date2 = new Date(array[i].expiryDate); // mm/dd/yyyy format
            var timeDiff = Math.abs(date2.getTime() - date1.getTime()); // in miliseconds
            var timeDiffInSecond = Math.ceil(timeDiff / (24 * 3600 * 1000));
            if (Number(timeDiffInSecond) <= 15) {
              countExpired = countExpired + 1;
            }
          }

          if (array.length > 0) {
            array.sort(function (a, b) {
              return b.dateAdded - a.dateAdded;
            });
          }

          res.render('adminquanlythuoc', {
            countExpired: countExpired,
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminquanlynhanvien(req, res) {
    var countExpired = 0;
    if (req.session.isAuth) {
      Employee.find((err, array) => {
        if (!err) {
          Product.find((err, listPro) => {
            if (!err) {
              for (var i = 0; i < listPro.length; i++) {
                var date1 = new Date(); // current date
                var date2 = new Date(listPro[i].expiryDate); // mm/dd/yyyy format
                var timeDiff = Math.abs(date2.getTime() - date1.getTime()); // in miliseconds
                var timeDiffInSecond = Math.ceil(timeDiff / (24 * 3600 * 1000));
                if (Number(timeDiffInSecond) <= 15) {
                  countExpired = countExpired + 1;
                }
              }
              res.render('adminquanlynhanvien', {
                countExpired: countExpired,
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
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminquanlykhohang(req, res) {
    const array = [];
    var countExpired = 0;
    if (req.session.isAuth) {
      Product.find((err, listPro) => {
        if (!err) {
          for (var i = 0; i < listPro.length; i++) {
            const proNew = new ProductNoti();
            var date1 = new Date(); // current date
            var date2 = new Date(listPro[i].expiryDate); // mm/dd/yyyy format
            var timeDiff = Math.abs(date2.getTime() - date1.getTime()); // in miliseconds
            var timeDiffInSecond = Math.ceil(timeDiff / (24 * 3600 * 1000));
            if (Number(timeDiffInSecond) <= 15) {
              countExpired = countExpired + 1;
            }
            if (date2.getTime() - date1.getTime() < 0) {
              proNew.idProductNoti = listPro[i].idProduct;
              proNew.name = listPro[i].name;
              proNew.idCategory = listPro[i].idCategory;
              proNew.idReceipt = listPro[i].idReceipt;
              proNew.manufacturingDate = listPro[i].manufacturingDate;
              proNew.expiryDate = listPro[i].expiryDate;
              proNew.imageList = listPro[i].imageList;
              proNew.importPrice = listPro[i].importPrice;
              proNew.salePrice = listPro[i].salePrice;
              proNew.format = listPro[i].format;
              proNew.packingForm = listPro[i].packingForm;
              proNew.uses = listPro[i].uses;
              proNew.component = listPro[i].component;
              proNew.specified = listPro[i].specified;
              proNew.antiDefinition = listPro[i].antiDefinition;
              proNew.dosage = listPro[i].dosage;
              proNew.sideEffects = listPro[i].sideEffects;
              proNew.careful = listPro[i].careful;
              proNew.preserve = listPro[i].preserve;
              proNew.trademark = listPro[i].trademark;
              proNew.origin = listPro[i].origin;
              proNew.quality = listPro[i].quality;
              proNew.sold = listPro[i].sold;
              proNew.retailQuantity = listPro[i].retailQuantity;
              proNew.quantityPerBox = listPro[i].quantityPerBox;
              proNew.retailQuantityPack = listPro[i].retailQuantityPack;
              proNew.status = listPro[i].status;
              proNew.isLimit = listPro[i].isLimit;
              proNew.countProExpired = timeDiffInSecond;
              array.push(proNew);
            }
          }
          res.render('adminquanlykhohang', {
            array: array,
            countExpired: countExpired,
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminhuythuoc(req, res) {
    const array = [];
    if (req.session.isAuth) {
      Product.delete({
        idProduct: req.body.idProduct,
        idReceipt: req.body.idReceipt,
      })
        .then(() => {
          req.flash('success', 'Huỷ thuốc thành công!');
          res.redirect('/quanly/quanlykhohang');
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminquanlydoanhthu(req, res) {
    var type = Number(req.params.type);
    var countExpired = 0;
    var sumMoney = 0;
    var dateNow = new Date();
    var ngay = dateNow.getDate();
    var thang = dateNow.getMonth() + 1;
    var nam = dateNow.getFullYear();
    var array = [];
    if (req.session.isAuth) {
      OrderDetails.find((err, orders) => {
        if (!err) {
          for (var i = 0; i < orders.length; i++) {
            var dateOrder = new Date(orders[i].time);

            if (type == 1) {
              if (
                dateOrder.getFullYear() == nam &&
                dateOrder.getMonth() + 1 == thang &&
                dateOrder.getDate() == ngay
              ) {
                sumMoney += orders[i].totalMoney;
                array.push(orders[i]);
              }
            } else if (type == 2) {
              if (
                dateOrder.getFullYear() == nam &&
                dateOrder.getMonth() + 1 == thang
              ) {
                sumMoney += orders[i].totalMoney;
                array.push(orders[i]);
              }
            } else if (type == 3) {
              sumMoney += orders[i].totalMoney;
              array.push(orders[i]);
            }

            if (i == orders.length - 1) {
              Product.find((err, listPro) => {
                if (!err) {
                  for (var i = 0; i < listPro.length; i++) {
                    var date1 = new Date(); // current date
                    var date2 = new Date(listPro[i].expiryDate); // mm/dd/yyyy format
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime()); // in miliseconds
                    var timeDiffInSecond = Math.ceil(
                      timeDiff / (24 * 3600 * 1000)
                    );
                    if (Number(timeDiffInSecond) <= 15) {
                      countExpired = countExpired + 1;
                    }
                  }
                  res.render('adminquanlydoanhthu', {
                    countExpired: countExpired,
                    array: array,
                    type: type,
                    sumMoney: sumMoney,
                    thang: thang,
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
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminquanlynhapkho(req, res) {
    var countExpired = 0;
    var sum = 0;
    if (req.session.isAuth) {
      Supplier.find((err, supplier) => {
        if (!err) {
          ProductTemp.find((err, array) => {
            if (!err) {
              if (array) {
                for (var i = 0; i < array.length; i++) {
                  sum += array[i].importPrice * array[i].quality;
                  console.log('=========sum', sum);
                }
                Product.find((err, listPro) => {
                  if (!err) {
                    for (var i = 0; i < listPro.length; i++) {
                      var date1 = new Date(); // current date
                      var date2 = new Date(listPro[i].expiryDate); // mm/dd/yyyy format
                      var timeDiff = Math.abs(
                        date2.getTime() - date1.getTime()
                      ); // in miliseconds
                      var timeDiffInSecond = Math.ceil(
                        timeDiff / (24 * 3600 * 1000)
                      );
                      if (Number(timeDiffInSecond) <= 15) {
                        countExpired = countExpired + 1;
                      }
                    }
                    res.render('adminquanlynhapkho', {
                      date: date1,
                      countExpired: countExpired,
                      array: array,
                      supplier: supplier[0],
                      sumAll: sum,
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
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }
  loadsanpham(req, res) {
    if (req.session.isAuth) {
      Product.find((err, data) => {
        if (!err) {
          res.send(data);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      });
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  loadmotsanpham(req, res) {
    if (req.session.isAuth) {
      Product.findOne(
        { idProduct: Number(req.params.idProduct) },
        (err, data) => {
          if (!err) {
            res.send(data);
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      );
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminthemnhapkho(req, res) {
    var countExpired = 0;
    if (req.session.isAuth) {
      Product.find((err, listPro) => {
        if (!err) {
          for (var i = 0; i < listPro.length; i++) {
            var date1 = new Date(); // current date
            var date2 = new Date(listPro[i].expiryDate); // mm/dd/yyyy format
            var timeDiff = Math.abs(date2.getTime() - date1.getTime()); // in miliseconds
            var timeDiffInSecond = Math.ceil(timeDiff / (24 * 3600 * 1000));
            if (Number(timeDiffInSecond) <= 15) {
              countExpired = countExpired + 1;
            }
          }
          res.render('adminthemnhapkho', {
            countExpired: countExpired,
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminluunhapkho(req, res) {
    var arrayNew = [];
    var receipt = new Receipt(req.body);
    if (req.session.isAuth) {
      ProductTemp.find((err, arrayNews) => {
        if (!err) {
          if (arrayNews.length > 0) {
            for (var i = 0; i < arrayNews.length; i++) {
              arrayNew.push(arrayNews[i]);
            }
            if (req.body.idInvoice.length <= 0) {
              req.flash('error', 'Mã hoá đơn không hợp lệ!');
              res.redirect('/quanly/quanlynhapkho/');
            } else {
              receipt
                .save()
                .then(() => {
                  Receipt.findOne(
                    {
                      idInvoice: Number(req.body.idInvoice),
                      totalMoney: Number(req.body.totalMoney),
                    },
                    (err, data) => {
                      if (!err) {
                        if (data) {
                          var idNew = data.idReceipt;
                          console.log('=========body idNew', idNew);
                          ProductTemp.find((err, array) => {
                            if (!err) {
                              if (array) {
                                for (var i = 0; i < array.length; i++) {
                                  const proNew = new Product();
                                  proNew.idProduct = array[i].idProduct;
                                  proNew.name = array[i].name;
                                  proNew.idCategory = array[i].idCategory;
                                  proNew.idReceipt = idNew;
                                  proNew.manufacturingDate =
                                    array[i].manufacturingDate;
                                  proNew.expiryDate = array[i].expiryDate;
                                  proNew.imageList = array[i].imageList;
                                  proNew.importPrice = array[i].priceImport;
                                  proNew.salePrice = array[i].priceSaleNew;
                                  proNew.format = array[i].format;
                                  proNew.packingForm = array[i].packingForm;
                                  proNew.uses = array[i].uses;
                                  proNew.component = array[i].component;
                                  proNew.specified = array[i].specified;
                                  proNew.antiDefinition =
                                    array[i].antiDefinition;
                                  proNew.dosage = array[i].dosage;
                                  proNew.sideEffects = array[i].sideEffects;
                                  proNew.careful = array[i].careful;
                                  proNew.preserve = array[i].preserve;
                                  proNew.trademark = array[i].trademark;
                                  proNew.origin = array[i].origin;
                                  proNew.quality = array[i].quality;
                                  proNew.sold = array[i].sold;
                                  proNew.retailQuantity =
                                    array[i].retailQuantity;
                                  proNew.quantityPerBox =
                                    array[i].quantityPerBox;
                                  proNew.retailQuantityPack =
                                    array[i].retailQuantityPack;
                                  proNew.status = array[i].status;

                                  proNew
                                    .save()
                                    .then(() => {
                                      if (i == array.length) {
                                        ProductTemp.find((err, temp) => {
                                          for (
                                            var i = 0;
                                            i < temp.length;
                                            i++
                                          ) {
                                            ProductTemp.delete({
                                              idProductTemp:
                                                temp[i].idProductTemp,
                                            })
                                              .then(() => {
                                                if (i == temp.length) {
                                                  res.redirect(
                                                    '/quanly/quanlythuoc'
                                                  );
                                                }
                                              })
                                              .catch(err => {});
                                          }
                                        }).lean();
                                      }
                                    })
                                    .catch(error => {
                                      console.log('=========error', error);
                                    });
                                }
                              }
                            } else {
                              res.status(400).json({ error: 'ERROR!!!' });
                            }
                          }).lean();
                        }
                      } else {
                        res.status(400).json({ error: 'ERROR!!!' });
                      }
                    }
                  );
                })
                .catch(error => {});
            }
          } else {
            req.flash('error', 'Bạn chưa thêm sản phẩm nhập kho!');
            res.redirect('/quanly/quanlynhapkho/');
          }
        }
      }).lean();

      // console.log('=========body 553', req.body);
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminnhapkho(req, res) {
    if (req.session.isAuth) {
      const proNew = new ProductTemp();
      let shortDate_1 = new Date(req.body.manufacturingDate);
      let manufacturingDate = Intl.DateTimeFormat('en-AU').format(shortDate_1);
      let expiryDate = moment(req.body.expiryDate).format('MM/DD/YYYY');
      Product.findOne({ idProduct: Number(req.body.idProduct) }, (err, pro) => {
        if (!err) {
          proNew.idProduct = pro.idProduct;
          proNew.name = pro.name;
          proNew.idCategory = pro.idCategory;
          proNew.idReceipt = '';
          proNew.manufacturingDate = manufacturingDate;
          proNew.expiryDate = expiryDate;
          proNew.imageList = pro.imageList;
          proNew.importPrice = Number(req.body.priceImport);
          proNew.salePrice = Number(req.body.priceSaleNew);
          proNew.format = pro.format;
          proNew.packingForm = pro.packingForm;
          proNew.uses = pro.uses;
          proNew.component = pro.component;
          proNew.specified = pro.specified;
          proNew.antiDefinition = pro.antiDefinition;
          proNew.dosage = pro.dosage;
          proNew.sideEffects = pro.sideEffects;
          proNew.careful = pro.careful;
          proNew.preserve = pro.preserve;
          proNew.trademark = pro.trademark;
          proNew.origin = pro.origin;
          proNew.quality = Number(req.body.qualityImport);
          proNew.sold = 0;
          proNew.retailQuantity = Number(
            req.body.qualityImport * pro.quantityPerBox
          );
          proNew.quantityPerBox = pro.quantityPerBox;
          proNew.retailQuantityPack = pro.retailQuantityPack;
          proNew.status = pro.status;

          proNew
            .save()
            .then(() => {
              res.redirect('/quanly/quanlynhapkho');
            })
            .catch(error => {
              console.log('=========error', error);
            });
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      });
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminthongbao(req, res) {
    const array = [];
    var countExpired = 0;
    if (req.session.isAuth) {
      Product.find((err, listPro) => {
        if (!err) {
          for (var i = 0; i < listPro.length; i++) {
            const proNew = new ProductNoti();
            var date1 = new Date(); // current date
            var date2 = new Date(listPro[i].expiryDate); // mm/dd/yyyy format
            var timeDiff = Math.abs(date2.getTime() - date1.getTime()); // in miliseconds
            var timeDiffInSecond = Math.ceil(timeDiff / (24 * 3600 * 1000));
            if (Number(timeDiffInSecond) <= 15) {
              countExpired = countExpired + 1;
              proNew.idProductNoti = listPro[i].idProduct;
              proNew.name = listPro[i].name;
              proNew.idCategory = listPro[i].idCategory;
              proNew.idReceipt = listPro[i].idReceipt;
              proNew.manufacturingDate = listPro[i].manufacturingDate;
              proNew.expiryDate = listPro[i].expiryDate;
              proNew.imageList = listPro[i].imageList;
              proNew.importPrice = listPro[i].importPrice;
              proNew.salePrice = listPro[i].salePrice;
              proNew.format = listPro[i].format;
              proNew.packingForm = listPro[i].packingForm;
              proNew.uses = listPro[i].uses;
              proNew.component = listPro[i].component;
              proNew.specified = listPro[i].specified;
              proNew.antiDefinition = listPro[i].antiDefinition;
              proNew.dosage = listPro[i].dosage;
              proNew.sideEffects = listPro[i].sideEffects;
              proNew.careful = listPro[i].careful;
              proNew.preserve = listPro[i].preserve;
              proNew.trademark = listPro[i].trademark;
              proNew.origin = listPro[i].origin;
              proNew.quality = listPro[i].quality;
              proNew.sold = listPro[i].sold;
              proNew.retailQuantity = listPro[i].retailQuantity;
              proNew.quantityPerBox = listPro[i].quantityPerBox;
              proNew.retailQuantityPack = listPro[i].retailQuantityPack;
              proNew.isLimit = listPro[i].isLimit;
              proNew.status = listPro[i].status;
              if (date2.getTime() - date1.getTime() < 0) {
                proNew.countProExpired = -timeDiffInSecond;
              } else {
                proNew.countProExpired = timeDiffInSecond;
              }

              array.push(proNew);
            }
          }
          res.render('adminthongbao', {
            array: array,
            countExpired: countExpired,
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  admixoathuoc(req, res) {
    console.log('=========error', req.params.idProduct);
    if (req.session.isAuth) {
      Product.delete({
        idProduct: req.params.idProduct,
      })
        .then(() => {
          req.flash('success', 'Xoá thuốc thành công!');
          res.redirect('/quanly/quanlythuoc');
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminloadthemthuocmoi(req, res) {
    var countExpired = 0;
    if (req.session.isAuth) {
      Product.find((err, listPro) => {
        if (!err) {
          for (var i = 0; i < listPro.length; i++) {
            var date1 = new Date(); // current date
            var date2 = new Date(listPro[i].expiryDate); // mm/dd/yyyy format
            var timeDiff = Math.abs(date2.getTime() - date1.getTime()); // in miliseconds
            var timeDiffInSecond = Math.ceil(timeDiff / (24 * 3600 * 1000));
            if (Number(timeDiffInSecond) <= 15) {
              countExpired = countExpired + 1;
            }
          }
          res.render('adminloadthemthuocmoi', {
            countExpired: countExpired,
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  loaddanhmuc(req, res) {
    if (req.session.isAuth) {
      Category.find((err, data) => {
        if (!err) {
          res.send(data);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      });
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminxoanhanvien(req, res) {
    if (req.session.isAuth) {
      Employee.delete({
        idEmployee: req.params.idEmployee,
      })
        .then(() => {
          Account.delete({
            username: req.params.idEmployee,
          })
            .then(() => {
              req.flash('successdeleteem', 'Xoá thành công!');
              res.redirect('/quanly/quanlynhanvien');
            })
            .catch(err => next(err));
        })
        .catch(err => next(err));
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminRenderThemnhanvien(req, res) {
    var countExpired = 0;
    if (req.session.isAuth) {
      res.render('adminthemnhanvien', {
        accountId: req.session.accountId,
        username: req.session.username,
        role: req.session.role,
        userId: req.session.userId,
        avatar: req.session.avatar,
        fullname: req.session.fullname,
      });
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminthemnhanvien(req, res, next) {
    console.log('BODY--', req.body);
    if (req.session.isAuth) {
      var date1 = new Date(); // current date
      var date2 = new Date(req.body.dateOfBirth); // mm/dd/yyyy format
      var date3 = new Date(req.body.dateOfBirth); // mm/dd/yyyy format
      var phoneformat = /((09|03|07|08|05)+([0-9]{8})\b)/g;
      var mailformat =
        /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (
        req.body.username.length <= 0 ||
        req.body.name.length <= 0 ||
        req.body.dateOfBirth.length <= 0 ||
        req.body.phoneNumber.length <= 0 ||
        req.body.email.length <= 0 ||
        req.body.address.length <= 0 ||
        req.body.dateStartWork.length <= 0
      ) {
        req.flash('error', 'Phải nhập đầy đủ các trường thông tin!');
        res.redirect('/quanly/themnhanvien');
      } else {
        Account.findOne({ username: req.body.username }, (err, data) => {
          if (!err) {
            if (data) {
              req.flash('error', 'Tên đăng nhập này đã tồn tại!');
              res.redirect('/quanly/themnhanvien');
            } else {
              if (req.body.name.length < 6) {
                req.flash('error', 'Họ và tên quá ngắn!');
                res.redirect('/quanly/themnhanvien');
              } else if (date2.getTime() - date1.getTime() >= 0) {
                req.flash('error', 'Ngày sinh phải nhỏ hơn ngày hiện tại!');
                res.redirect('/quanly/themnhanvien');
              } else if (date3.getTime() - date1.getTime() > 0) {
                req.flash(
                  'error',
                  'Ngày bắt đầu làm việc phải nhỏ hơn hoặc bằng ngày hiện tại!'
                );
                res.redirect('/quanly/themnhanvien');
              } else if (!req.body.phoneNumber.match(phoneformat)) {
                req.flash('error', 'Số điện thoại sai định dạng!');
                res.redirect('/quanly/themnhanvien');
              } else if (!req.body.email.match(mailformat)) {
                req.flash('error', 'Email sai định dạng!');
                res.redirect('/quanly/themnhanvien');
              } else {
                const account = new Account();
                account.username = req.body.username;
                account.password = '12345678';
                account.role = 2;
                account
                  .save()
                  .then(() => {
                    Account.findOne(
                      { username: req.body.username },
                      (err, acc) => {
                        if (!err) {
                          if (acc) {
                            const user = new Employee(req.body);
                            user.idAccount = acc.idAccount;
                            user.idEmployee = acc.username;
                            user
                              .save()
                              .then(() => {
                                req.flash(
                                  'successAddEm',
                                  'Thêm nhân viên mới thành công!'
                                );
                                res.redirect('/quanly/quanlynhanvien');
                              })
                              .catch(error => {
                                console.log('ERRORR Employee', error);
                              });
                          } else {
                            res.status(400).json({ error: 'ERROR!!!' });
                          }
                        } else {
                          res.status(400).json({ error: 'ERROR!!!' });
                        }
                      }
                    ).lean();
                  })
                  .catch(error => {});
              }
            }
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

  //===========KHÁCH HÀNG===============

  homekh(req, res) {
    var numberCart = 0;
    const arrayNew = [];
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
                      status: 1,
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
                        if (req.session.role == 1) {
                          for (var i = 0; i < array.length; i++) {
                            var date1 = new Date(); // current date
                            var date2 = new Date(array[i].expiryDate);
                            if (
                              date2.getTime() - date1.getTime() >= 0 &&
                              Number(array[i].quality - array[i].sold) > 0
                            ) {
                              arrayNew.push(array[i]);
                            }
                          }
                          res.render('homekh', {
                            numberCart: numberCart,
                            danhmuc: danhmuc,
                            array: arrayNew,
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
                for (var i = 0; i < array.length; i++) {
                  var date1 = new Date(); // current date
                  var date2 = new Date(array[i].expiryDate);
                  if (
                    date2.getTime() - date1.getTime() >= 0 &&
                    Number(array[i].quality - array[i].sold) > 0
                  ) {
                    arrayNew.push(array[i]);
                  }
                }
                res.render('homekh', {
                  danhmuc: danhmuc,
                  array: arrayNew,
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
    const arrayNew = [];
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
                    sess.accountId = user.idAccount;
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
                                      status: 1,
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
                                        if (req.session.role == 1) {
                                          for (
                                            var i = 0;
                                            i < array.length;
                                            i++
                                          ) {
                                            var date1 = new Date(); // current date
                                            var date2 = new Date(
                                              array[i].expiryDate
                                            );
                                            if (
                                              date2.getTime() -
                                                date1.getTime() >=
                                                0 &&
                                              Number(
                                                array[i].quality - array[i].sold
                                              ) > 0
                                            ) {
                                              arrayNew.push(array[i]);
                                            }
                                          }
                                          res.render('homekh', {
                                            numberCart: numberCart,
                                            danhmuc: danhmuc,
                                            array: arrayNew,
                                            accountId: req.session.accountId,
                                            username: req.session.username,
                                            role: req.session.role,
                                            userId: req.session.userId,
                                            avatar: req.session.avatar,
                                            fullname: req.session.fullname,
                                          });
                                        }
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

  renderRegister(req, res) {
    res.render('register');
  }

  register = (req, res, next) => {
    const { username, email, password, repassword, role } = req.body;
    console.log('========log', req.body);
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (username.length < 6) {
      req.flash('error', 'Tên đăng nhập phải trên 6 ký tự!');
      res.redirect('/register');
    } else {
      Account.findOne({ username: username }, (err, data) => {
        if (!err) {
          if (data) {
            req.flash('error', 'Tên đăng nhập đã tồn tại!');
            res.redirect('/register');
          } else {
            if (email.match(mailformat)) {
              Customer.findOne({ email: email }, (err, data) => {
                if (!err) {
                  if (data) {
                    req.flash('error', 'Email đã tồn tại!');
                    res.redirect('/register');
                  } else {
                    if (password.length < 8) {
                      req.flash('error', 'Mật khẩu phải từ 8 ký tự!');
                      res.redirect('/register');
                    } else {
                      if (password == repassword) {
                        const account = new Account();
                        account.username = username;
                        account.password = password;
                        account.role = role;
                        // babycare032023@gmail.com
                        account
                          .save()
                          .then(() => {
                            Account.findOne(
                              { username: username },
                              (err, data) => {
                                if (!err) {
                                  if (data) {
                                    const user = new Customer();
                                    user.email = email;
                                    user.idAccount = data.idAccount;
                                    user.status = 0;
                                    user
                                      .save()
                                      .then(() => {
                                        // sendOTPEmail({ username, email });
                                        // 12345678

                                        let transporter =
                                          nodemailer.createTransport({
                                            host: 'smtp.gmail.com',
                                            port: 465,
                                            secure: true,
                                            auth: {
                                              type: 'login',
                                              user: 'haphuong09031993@gmail.com',
                                              pass: 'aoayfjhrxdjzceux',
                                            },
                                          });

                                        const otp = `${Math.floor(
                                          1000 + Math.random() * 9000
                                        )}`;

                                        const mailOptions = {
                                          from: 'haphuong09031993@gmail.com',
                                          to: email,
                                          subject:
                                            'LenPharmacy! Xác thực email của bạn',
                                          html: `<p> Mã xác nhận của bạn tại LenPharmacy là: <b>${otp}</b></p>`,
                                        };

                                        const otpEmail = new EmailOTP({
                                          userName: username,
                                          otp: otp,
                                          createAt: Date.now(),
                                          expireAt: Date.now() + 3600000,
                                        });

                                        otpEmail
                                          .save()
                                          .then(() => {
                                            transporter.sendMail(mailOptions);
                                            res.redirect(`/verify/${username}`);
                                          })
                                          .catch(error => {
                                            console.log(
                                              'ERRORR otpEmail',
                                              error
                                            );
                                          });
                                      })
                                      .catch(error => {
                                        console.log('ERRORR Customer', error);
                                      });
                                  } else {
                                    res.status(400).json({ error: 'ERROR!!!' });
                                  }
                                } else {
                                  res.status(400).json({ error: 'ERROR!!!' });
                                }
                              }
                            ).lean();
                          })
                          .catch(error => {});
                      } else {
                        req.flash('error', 'Mật khẩu nhập lại không trùng!');
                        res.redirect('/register');
                      }
                    }
                  }
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }).lean();
            } else {
              req.flash('error', 'Email sai định dạng!');
              res.redirect('/register');
            }
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    }
  };

  renderVerification(req, res) {
    Account.findOne({ username: req.params.username }, (err, data) => {
      if (!err) {
        if (data) {
          Customer.findOne({ idAccount: data.idAccount }, (err, dataUser) => {
            if (!err) {
              if (dataUser) {
                res.render('otpverification', {
                  dataUser: dataUser,
                  username: req.params.username,
                });
              }
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

  verification(req, res) {
    EmailOTP.findOne({ userName: req.body.userName }, (err, data) => {
      if (!err) {
        if (data) {
          if (bcrypt.compareSync(req.body.optEmail, data.otp)) {
            Customer.updateOne(
              { idCustomer: Number(req.body.idCustomer) },
              { status: 1, avatar: req.body.avatar }
            )
              .then(() => {
                req.flash('success', 'Đăng ký tài khoản thành công!');
                res.redirect('/login');
              })
              .catch(err => {
                console.log('=========err', err);
              });
          } else {
            usertest;
            req.flash('error', 'Mã OTP chưa chính xác!');
            res.redirect(`/verify/${req.body.userName}`);
          }
        }
      } else {
        res.status(400).json({ error: 'ERROR!!!' });
      }
    }).lean();
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
                      status: 1,
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
      if (Number(req.body.isLimit) == 1) {
        req.flash('errorchitiet', 'Cần tham khảo ý kiến Bác Sĩ!');
        res.redirect(`/chitietsanpham/${req.body.idProduct}`);
      } else {
        Cart.findOne(
          {
            idProduct: req.body.idProduct,
            idCustomer: req.body.idCustomer,
            status: 1,
          },
          (err, isCart) => {
            if (!err) {
              if (isCart) {
                if (isCart.quality == 5) {
                  req.flash(
                    'error',
                    'Bạn đã thêm quá số lượng thuốc quy định!'
                  );
                  res.redirect('/giohang');
                } else {
                  Cart.updateOne(
                    { idCart: isCart.idCart },
                    { quality: isCart.quality + 1 }
                  )
                    .then(() => {
                      req.flash('success', 'Thêm vào giỏ hàng thành công!');
                      res.redirect('/home');
                    })
                    .catch(error => {});
                }
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
      }
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
          status: 1,
        },
        (err, listCart) => {
          if (!err) {
            if (listCart.length > 0) {
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
                      productCart.sold = pro.sold;
                      productCart.retailQuantity = pro.retailQuantity;
                      productCart.quantityPerBox = pro.quantityPerBox;
                      productCart.retailQuantityPack = pro.retailQuantityPack;
                      productCart.status = pro.status;
                      productCart.isLimit = pro.isLimit;
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
              res.render('giohangkh', {
                numberCart: 0,
                array: array,
                sumPrice: 0,
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
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  adminthongkesanpham(req, res) {
    var array = [];
    if (req.session.isAuth) {
      Product.find((err, pro) => {
        if (!err) {
          pro.sort(function (a, b) {
            return b.sold - a.sold;
          });
          if (pro.length > 5) {
            for (var i = 0; i < 5; i++) {
              array.push(pro[i]);
            }
          } else {
            for (var i = 0; i < pro.length; i++) {
              array.push(pro[i]);
            }
          }
          res.render('adminthongkesanpham', {
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  admindanhsachphieunhapkho(req, res) {
    var array = [];

    if (req.session.isAuth) {
      Receipt.find((err, pro) => {
        if (!err) {
          for (var i = 0; i < pro.length; i++) {
            const receiptTemps = new ReceiptTemps();
            var idSup = '';
            receiptTemps.idReceiptTemps = pro[i].idReceipt;
            receiptTemps.time = pro[i].time;
            receiptTemps.idInvoice = pro[i].idInvoice;
            receiptTemps.idSupplier = pro[i].idSupplier;
            receiptTemps.totalMoney = pro[i].totalMoney;
            receiptTemps.status = pro[i].status;
            receiptTemps.createdAt = pro[i].createdAt;
            receiptTemps.updatedAt = pro[i].updatedAt;
            idSup = pro[i].idSupplier;
            Product.find(
              { idReceipt: Number(pro[i].idReceipt) },
              (err, pros) => {
                if (!err) {
                  receiptTemps.totalProducts = pros.length;
                  Supplier.findOne({ idSupplier: idSup }, (err, sup) => {
                    if (!err) {
                      receiptTemps.nameSupplier = sup.name;
                      array.push(receiptTemps);
                      if (i == pro.length) {
                        array.sort(function (a, b) {
                          return b.time - a.time; // sắp xếp theo lượng like
                        });
                        res.render('admindanhsachphieunhapkho', {
                          array: array,
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
                  }).lean();
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }
            ).lean();
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  sanphamtheodanhmuc(req, res) {
    var numberCart = 0;
    const arrayNew = [];
    if (req.session.isAuth) {
      if (req.session.role == 1) {
        Category.find((err, danhmuc) => {
          if (!err) {
            if (danhmuc) {
              Product.find(
                { idCategory: req.params.idCategory },
                (err, array) => {
                  if (!err) {
                    Cart.find(
                      {
                        idCustomer: req.session.userId,
                        status: 1,
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
                          if (req.session.role == 1) {
                            for (var i = 0; i < array.length; i++) {
                              var date1 = new Date(); // current date
                              var date2 = new Date(array[i].expiryDate);
                              if (
                                date2.getTime() - date1.getTime() >= 0 &&
                                Number(array[i].quality - array[i].sold) > 0
                              ) {
                                arrayNew.push(array[i]);
                              }
                            }
                            res.render('sanphamtheodanhmuc', {
                              numberCart: numberCart,
                              danhmuc: danhmuc,
                              array: arrayNew,
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
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }
              ).lean();
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
            Product.find(
              { idCategory: req.params.idCategory },
              (err, array) => {
                if (!err) {
                  for (var i = 0; i < array.length; i++) {
                    var date1 = new Date(); // current date
                    var date2 = new Date(array[i].expiryDate);
                    if (
                      date2.getTime() - date1.getTime() >= 0 &&
                      Number(array[i].quality - array[i].sold) > 0
                    ) {
                      arrayNew.push(array[i]);
                    }
                  }
                  res.render('homekh', {
                    danhmuc: danhmuc,
                    array: arrayNew,
                  });
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }
            ).lean();
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    }
  }

  thanhtoankh(req, res) {
    var sumPrice = 0;
    const array = [];
    const arrayPro = [];
    const arrayProQua = [];
    var sumQuality = 0;
    if (req.session.isAuth) {
      Cart.find(
        {
          idCustomer: req.session.userId,
          status: 1,
        },
        (err, listOrder) => {
          if (!err) {
            if (listOrder.length > 0) {
              for (var i = 0; i < listOrder.length; i++) {
                sumPrice += listOrder[i].salePrice * listOrder[i].quality;
                sumQuality = listOrder.length;
                array.push(listOrder[i].idCart);
                arrayPro.push(listOrder[i].idProduct);
                arrayProQua.push(listOrder[i].quality);
              }
              for (var i = 0; i < arrayPro.length; i++) {
                var qualityNew = 0;
                qualityNew = arrayProQua[i];

                Product.findOne({ idProduct: arrayPro[i] }, (err, array) => {
                  if (!err) {
                    var sold = 0;
                    sold = array.sold + qualityNew;
                    Product.updateOne(
                      { idProduct: array.idProduct },
                      { sold: sold }
                    )
                      .then(() => {
                        console.log('TRUEEE');
                      })
                      .catch(err => {});
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }).lean();
              }

              const payments = new Payment();
              payments.idCart = array;
              payments.totalMoney = sumPrice;
              payments.totalQuality = sumQuality;
              payments.paymentType = 'Tiền mặt';
              payments.status = 1;
              payments.idCustomer = req.session.userId;
              payments
                .save()
                .then(() => {
                  for (var i = 0; i < array.length; i++) {
                    Cart.updateOne(
                      {
                        idCart: array[i],
                      },
                      { status: 0 }
                    )
                      .then(() => {
                        if (i == array.length) {
                          req.flash('success', 'Thanh toán thành công!');
                          res.redirect('/danhsachdonhang');
                        }
                      })
                      .catch(err => {});
                  }
                })
                .catch(error => {});
            } else {
              req.flash('error', 'Chưa chọn sản phẩm thanh toán!');
              res.redirect('/giohang');
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

  danhsachdonhangkh(req, res) {
    var listIdOrder = [];
    var listOrder = [];
    var listOrderTemp = [];
    var idEmployee;
    var numberCart = 0;
    if (req.session.isAuth) {
      Cart.find(
        {
          idCustomer: req.session.userId,
          status: 1,
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
            Payment.find(
              {
                idCustomer: req.session.userId,
                status: 1,
              },
              (err, listPayment) => {
                if (!err) {
                  if (listPayment.length > 0) {
                    listPayment.sort(function (a, b) {
                      return b.paymentDate - a.paymentDate;
                    });
                  }
                  res.render('danhsachdonhangkh', {
                    numberCart: numberCart,
                    listPayment: listPayment,
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
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  chitietdonhangkh(req, res) {
    var listIdCart = [];
    var listProduct = [];
    var numberCart = 0;
    if (req.session.isAuth) {
      Cart.find(
        {
          idCustomer: req.session.userId,
          status: 1,
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
            Payment.findOne(
              {
                idPayment: Number(req.params.idPayment),
                status: 1,
              },
              (err, payment) => {
                if (!err) {
                  listIdCart = payment.idCart;
                  for (var i = 0; i < payment.idCart.length; i++) {
                    const product = new Product();
                    Cart.findOne(
                      { idCart: Number(listIdCart[i]) },
                      function (err, cart) {
                        if (!err) {
                          product.quality = cart.quality;
                          console.log('quality====', cart.quality);
                          Product.findOne(
                            { idProduct: Number(cart.idProduct) },
                            function (err, pro) {
                              if (!err) {
                                product.idProduct = pro.idProduct;
                                product.name = pro.name;
                                product.imageList = pro.imageList;
                                product.salePrice = pro.salePrice;
                                product.form = pro.form;
                                product.format = pro.format;
                                product.packingForm = pro.packingForm;
                                listProduct.push(product);
                              }
                            }
                          ).lean();
                        }
                      }
                    ).lean();
                  }
                  res.render('chitietdonhangkh', {
                    payment: payment,
                    listProduct: listProduct,
                    numberCart: numberCart,
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
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  adminchitietphieunhapkho(req, res) {
    var listIdOrder = [];
    var listOrder = [];
    var listOrderTemp = [];
    var idEmployee;
    if (req.session.isAuth) {
      Receipt.findOne(
        { idReceipt: Number(req.params.idReceipt) },
        (err, orderDetail) => {
          if (orderDetail) {
            listOrder.push(orderDetail);
          }
          if (!err) {
            Product.find(
              {
                idReceipt: Number(req.params.idReceipt),
              },
              (err, order) => {
                if (!err) {
                  if (order) {
                    console.log('----------', listOrder[0]);
                    console.log('----------order', order.length);
                    res.render('adminchitietphieunhapkho', {
                      orderDetail: orderDetail,
                      order: order,
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
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }
}
module.exports = new MainController();
