const express = require('express');
const router = express.Router();
const mainController = require('../app/controllers/MainController');
let upload = require('../database/multer.config');

router.get('/quanly/home', mainController.home);
router.get('/quanly/login', mainController.loginql);
router.post('/quanly/login', mainController.login);

//------DƯỢC SĨ
router.get('/quanly/taodonhang', mainController.taodonhangds);
router.post('/quanly/taodonhang', mainController.laydonhangds);
router.get('/quanly/thanhtoan', mainController.thanhtoands);
router.get('/quanly/quanlykhachhang', mainController.quanlykhachhangds);
router.get('/quanly/quanlydonhang', mainController.quanlydonhangds);
router.get('/quanly/thongke', mainController.thongkeds);
router.get('/quanly/xemthongtincanhan', mainController.xemthongtincanhands);

//------ADMIN
router.get('/quanly/quanlythuoc', mainController.adminquanlythuoc);
router.get('/quanly/quanlynhanvien', mainController.adminquanlynhanvien);
router.get('/quanly/quanlykhohang', mainController.adminquanlykhohang);
router.get('/quanly/quanlydoanhthu/:type', mainController.adminquanlydoanhthu);
router.get('/quanly/quanlynhapkho', mainController.adminquanlynhapkho);
router.get('/quanly/loadsanpham', mainController.loadsanpham);
router.get('/quanly/loadmotsanpham/:idProduct', mainController.loadmotsanpham);
router.get('/quanly/themnhapkho', mainController.adminthemnhapkho);
router.post('/quanly/nhapkho', mainController.adminnhapkho);
router.post('/quanly/luunhapkho', mainController.adminluunhapkho);
router.get('/quanly/thongbao', mainController.adminthongbao);
router.post('/quanly/huythuoc', mainController.adminhuythuoc);

//===========KHÁCH HÀNG===============
router.get('/home', mainController.homekh);
router.get('/login', mainController.loginqlkh);
router.post('/login', mainController.loginkh);
router.get('/register', mainController.register);
router.get('/chitietsanpham/:idProduct', mainController.chitietsanphamkh);
router.post('/themgiohang', mainController.themgiohangkh);
router.get('/giohang', mainController.giohangkh);

module.exports = router;
