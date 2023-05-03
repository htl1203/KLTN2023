const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const Order = new Schema(
  {
    idOrder: { type: Number },
    idEmployee: { type: String, maxLength: 255 },
    idProduct: { type: Number },
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
Order.plugin(AutoIncrement, { inc_field: 'idOrder' });
Order.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Order', Order);
