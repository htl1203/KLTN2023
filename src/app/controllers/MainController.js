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

const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs');

class MainController {
  // [GET] /home
  home(req, res) {
    if (req.session.isAuth) {
      if (req.session.role == 2) {
        Product.find((err, array) => {
          if (!err) {
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
  taodonhangds(req, res) {
    var sumPrice = 0;
    if (req.session.isAuth) {
      Order.find(
        {
          idEmployee: req.session.userId,
        },
        (err, listOrder) => {
          if (listOrder) {
            for (var i = 0; i < listOrder.length; i++) {
              sumPrice += listOrder[i].salePrice * listOrder[i].quality;
              console.log('=========sumPrice', sumPrice);
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
                  listOrder: listOrder,
                  sumPrice: sumPrice,
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
                    Order.delete({
                      idOrder: array[i],
                    })
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
  //------ADMIN
  adminquanlythuoc(req, res) {
    if (req.session.isAuth) {
      Product.find((err, array) => {
        if (!err) {
          res.render('adminquanlythuoc', {
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
    if (req.session.isAuth) {
      Employee.find((err, array) => {
        if (!err) {
          res.render('adminquanlynhanvien', {
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

  adminquanlykhohang(req, res) {
    if (req.session.isAuth) {
      Product.find((err, array) => {
        if (!err) {
          res.render('adminquanlykhohang', {
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
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminquanlynhapkho(req, res) {
    var sum = 0;
    if (req.session.isAuth) {
      Supplier.find((err, supplier) => {
        if (!err) {
          // console.log('=========Supplier', supplier[0].name);
          // var supplier = '' + supplier[0].name;
          ProductTemp.find((err, array) => {
            if (!err) {
              if (array) {
                for (var i = 0; i < array.length; i++) {
                  sum += array[i].importPrice * array[i].quality;
                  console.log('=========sum', sum);
                }
                res.render('adminquanlynhapkho', {
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
    if (req.session.isAuth) {
      res.render('adminthemnhapkho', {
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

  adminluunhapkho(req, res) {
    var receipt = new Receipt(req.body);
    console.log('=========body receipt', receipt);
    if (req.session.isAuth) {
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
                          proNew.manufacturingDate = array[i].manufacturingDate;
                          proNew.expiryDate = array[i].expiryDate;
                          proNew.imageList = array[i].imageList;
                          proNew.importPrice = array[i].priceImport;
                          proNew.salePrice = array[i].priceSaleNew;
                          proNew.format = array[i].format;
                          proNew.packingForm = array[i].packingForm;
                          proNew.uses = array[i].uses;
                          proNew.component = array[i].component;
                          proNew.specified = array[i].specified;
                          proNew.antiDefinition = array[i].antiDefinition;
                          proNew.dosage = array[i].dosage;
                          proNew.sideEffects = array[i].sideEffects;
                          proNew.careful = array[i].careful;
                          proNew.preserve = array[i].preserve;
                          proNew.trademark = array[i].trademark;
                          proNew.origin = array[i].origin;
                          proNew.quality = array[i].qualityImport;
                          proNew.sold = array[i].sold;
                          proNew.retailQuantity = array[i].retailQuantity;
                          proNew.quantityPerBox = array[i].quantityPerBox;
                          proNew.retailQuantityPack =
                            array[i].retailQuantityPack;
                          proNew.status = array[i].status;

                          proNew
                            .save()
                            .then(() => {
                              if (i == array.length) {
                                ProductTemp.find((err, temp) => {
                                  for (var i = 0; i < temp.length; i++) {
                                    ProductTemp.delete({
                                      idProductTemp: temp[i].idProductTemp,
                                    })
                                      .then(() => {
                                        if (i == temp.length) {
                                          res.redirect('/quanly/quanlykhohang');
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
      // console.log('=========body 553', req.body);
    } else {
      req.session.back = '/quanly/home';
      res.redirect('/quanly/login/');
    }
  }

  adminnhapkho(req, res) {
    if (req.session.isAuth) {
      const proNew = new ProductTemp();
      Product.findOne({ idProduct: Number(req.body.idProduct) }, (err, pro) => {
        if (!err) {
          proNew.idProduct = pro.idProduct;
          proNew.name = pro.name;
          proNew.idCategory = pro.idCategory;
          proNew.idReceipt = '';
          proNew.manufacturingDate = req.body.manufacturingDate;
          proNew.expiryDate = req.body.expiryDate;
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
                      productCart.sold = pro.sold;
                      productCart.retailQuantity = pro.retailQuantity;
                      productCart.quantityPerBox = pro.quantityPerBox;
                      productCart.retailQuantityPack = pro.retailQuantityPack;
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
