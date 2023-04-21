const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const OrderDetails = new Schema(
  {
    idOrderDetail: { type: Number },
    idOrder: { type: Number },
    totalMoney: { type: Number },
    totalQuality: { type: Number },
    paymentType: { type: String, maxLength: 255 },
    status: { type: Number },
    time: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
OrderDetails.plugin(AutoIncrement, { inc_field: 'idOrderDetail' });
OrderDetails.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});

module.exports = mongoose.model('OrderDetails', OrderDetails);
