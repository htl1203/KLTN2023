const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const OrderTemp = new Schema(
  {
    idOrderTemp: { type: Number },
    idEmployee: { type: String, maxLength: 255 },
    idProduct: { type: Number },
    nameProduct: { type: String, maxLength: 255 },
    imageProduct: { type: String, maxLength: 255 },
    packingForm: { type: String, maxLength: 255 },
    quality: { type: Number },
    salePrice: { type: Number },
    orderDate: { type: Date, default: Date.now },
    status: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
OrderTemp.plugin(AutoIncrement, { inc_field: 'idOrderTemp' });
OrderTemp.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('OrderTemp', OrderTemp);
