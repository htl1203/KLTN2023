const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const Payment = new Schema(
  {
    idPayment: { type: Number },
    idCart: { type: Array },
    idCustomer: { type: Number },
    totalMoney: { type: Number },
    totalQuality: { type: Number },
    paymentType: { type: String, maxLength: 255 },
    paymentDate: { type: Date, default: Date.now },
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
Payment.plugin(AutoIncrement, { inc_field: 'idPayment' });
Payment.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Payment', Payment);
