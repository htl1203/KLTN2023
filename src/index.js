const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const route = require('./routers');
var session = require('express-session');
var flash = require('express-flash');
const db = require('./config/db');
const {
  allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
var moment = require('moment');
const path = require('path');

db.connect();
const app = express();
const port = 3000;

// HTTP logger
app.use(morgan('combined'));

// cấu hình file tỉnh ( từ các file trong public)
app.use(express.static(path.join(__dirname, 'public')));

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Template engine
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    helpers: {
      sum: (a, b) => a + b,
      changeNgay: datee => new Intl.DateTimeFormat('en-AU').format(datee),
      changeTimeMonment: datee => {
        var date = new moment(datee, 'MM/DD/YYYY');
        return new Intl.DateTimeFormat('en-AU').format(date);
      },
      getTime: datee => {
        var h = datee.getHours();
        var m = datee.getMinutes();
        if (h <= 9) h = '0' + h;
        if (m <= 9) m = '0' + m;
        var time = '' + h + ':' + m;
        return time;
      },
      isQuality: number => {
        var number1 = Number(number);
        if (number1 <= 0) {
          return true;
        } else {
          return false;
        }
      },
      isExpires: date => {
        var date1 = new Date(); // current date
        var date2 = new Date(date);
        if (date2.getTime() - date1.getTime() < 0) {
          return true;
        } else {
          return false;
        }
      },
      changeDiemTichLuy: diemTL => {
        diemTL = diemTL / 1000;
        diemTL = '' + diemTL;
        if (diemTL.length > 3) {
          var mod = diemTL.length % 3;
          var output = mod > 0 ? diemTL.substring(0, mod) : '';
          for (i = 0; i < Math.floor(diemTL.length / 3); i++) {
            if (mod == 0 && i == 0)
              output += diemTL.substring(mod + 3 * i, mod + 3 * i + 3);
            else output += ',' + diemTL.substring(mod + 3 * i, mod + 3 * i + 3);
          }
          return output;
        } else return diemTL;
      },
      changeNumber: number => {
        number = '' + number;
        if (number.length > 3) {
          var mod = number.length % 3;
          var output = mod > 0 ? number.substring(0, mod) : '';
          for (i = 0; i < Math.floor(number.length / 3); i++) {
            if (mod == 0 && i == 0)
              output += number.substring(mod + 3 * i, mod + 3 * i + 3);
            else output += ',' + number.substring(mod + 3 * i, mod + 3 * i + 3);
          }
          return output;
        } else return number;
      },
      sumCart: (number1, number2) => {
        var sum = 0;
        sum = number1 * number2;
        sum = '' + sum;
        if (sum.length > 3) {
          var mod = sum.length % 3;
          var output = mod > 0 ? sum.substring(0, mod) : '';
          for (i = 0; i < Math.floor(sum.length / 3); i++) {
            if (mod == 0 && i == 0)
              output += sum.substring(mod + 3 * i, mod + 3 * i + 3);
            else output += ',' + sum.substring(mod + 3 * i, mod + 3 * i + 3);
          }
          return output;
        } else return sum;
      },
      differenceTwoNumber: (number1, number2) => {
        var sum = 0;
        sum = number1 - number2;
        sum = '' + sum;
        if (sum.length > 3) {
          var mod = sum.length % 3;
          var output = mod > 0 ? sum.substring(0, mod) : '';
          for (i = 0; i < Math.floor(sum.length / 3); i++) {
            if (mod == 0 && i == 0)
              output += sum.substring(mod + 3 * i, mod + 3 * i + 3);
            else output += ',' + sum.substring(mod + 3 * i, mod + 3 * i + 3);
          }
          return output;
        } else return sum;
      },
      // noidung: thongtinMH =>
      //   mahoa.AES.encrypt(String(thongtinMH), 'diep123').toString(),
      ifCond: (v1, operator, v2, options) => {
        switch (operator) {
          case '==':
            return v1 == v2 ? options.fn(this) : options.inverse(this);
          case '===':
            return v1 === v2 ? options.fn(this) : options.inverse(this);
          case '!=':
            return v1 != v2 ? options.fn(this) : options.inverse(this);
          case '!==':
            return v1 !== v2 ? options.fn(this) : options.inverse(this);
          case '<':
            return v1 < v2 ? options.fn(this) : options.inverse(this);
          case '<=':
            return v1 <= v2 ? options.fn(this) : options.inverse(this);
          case '>':
            return v1 > v2 ? options.fn(this) : options.inverse(this);
          case '>=':
            return v1 >= v2 ? options.fn(this) : options.inverse(this);
          case '&&':
            return v1 && v2 ? options.fn(this) : options.inverse(this);
          case '||':
            return v1 || v2 ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },
      handlebars: allowInsecurePrototypeAccess(Handlebars),
    },
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

app.use(
  session({
    secret: '123456cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1800000 },
  })
);
// const data = require('./database/db.config');

// config  aws
const multer = require('multer');
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const { v4: uuid } = require('uuid');
const { error } = require('console');
const Product = require('./app/model/Product');

const awsConfig = {
  accessKeyId: 'AKIA5HNAI5CXIHX5736U',
  secretAccessKey: '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',
  region: 'ap-southeast-1',
};

const s3 = new AWS.S3(awsConfig);

const storage = multer.memoryStorage({
  destination(req, file, callback) {
    callback(null, '');
  },
});

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;

  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const minetype = fileTypes.test(file.mimetype);
  if (extname && minetype) {
    return cb(null, true);
  }

  return cb('Error: Image Only!');
}

const upload = multer({
  storage,
  limits: { fieldSize: 2000000 },
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

const CLOUND_FONT_URL = 'https://babycaredoan.s3.ap-southeast-1.amazonaws.com/';

app.post(
  '/quanly/themthuocmoi',
  upload.single('imageList'),
  async (req, res) => {
    const file = req.file;

    console.log('201-- ', req.body);

    const image = file.originalname.split('.');
    const fileType = image[image.length - 1];
    const filePath = `${uuid() + Date.now().toString()}.${fileType}`;

    const params = {
      Bucket: 'babycaredoan',
      Key: filePath,
      Body: file.buffer,
    };

    s3.upload(params, (error, data) => {
      if (error) {
        return res.send('Internal Server Error');
      } else {
        const pro = new Product(req.body);
        pro.imageList = `${CLOUND_FONT_URL}${filePath}`;
        pro
          .save()
          .then(() => {
            // req.flash('error', 'Thêm thuốc thành công!');
            res.redirect('/quanly/quanlythuoc');
          })
          .catch(error => {
            console.log('-----error----', error);
          });
      }
    });
  }
);
global.__basedir = __dirname;
// force: true will drop the table if it already exists
// data.sequelize.sync({ force: false }).then(() => {
// console.log("Drop and Resync with { force: false }");
// });
// =====

app.use(flash());

route(app);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
