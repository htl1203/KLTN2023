const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const Cart = new Schema(
  {
    idCart: { type: Number },
    idProduct: { type: Number },
    quality: { type: Number },
    idCustomer: { type: Number },
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
Cart.plugin(AutoIncrement, { inc_field: 'idCart' });
Cart.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Cart', Cart);
