const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const PaymentTemp = new Schema(
  {
    idPaymentTemp: { type: Number },
    idCart: { type: Array },
    listProduct: { type: Array },
    idCustomer: { type: Number },
    totalMoney: { type: Number },
    totalQuality: { type: Number },
    paymentType: { type: String, maxLength: 255 },
    paymentDate: { type: Date },
    status: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
PaymentTemp.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('PaymentTemp', PaymentTemp);
