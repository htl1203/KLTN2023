const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

const Receipt = new Schema(
  {
    idReceipt: { type: Number },
    time: { type: Date, default: Date.now },
    idInvoice: { type: Number },
    idSupplier: { type: String, maxLength: 255 },
    totalMoney: { type: Number },
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
Receipt.plugin(AutoIncrement, { inc_field: 'idReceipt' });
Receipt.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Receipt', Receipt);
