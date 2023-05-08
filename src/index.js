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
