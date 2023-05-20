const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

const idReceiptTemps = new Schema(
  {
    idReceiptTemps: { type: Number },
    time: { type: Date },
    idInvoice: { type: Number },
    idSupplier: { type: String, maxLength: 255 },
    nameSupplier: { type: String, maxLength: 255 },
    totalProducts: { type: Number },
    totalMoney: { type: Number },
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
idReceiptTemps.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});

module.exports = mongoose.model('idReceiptTemps', idReceiptTemps);
