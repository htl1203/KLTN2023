const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const Product = new Schema(
  {
    idProduct: { type: Number },
    name: { type: Number },
    information: { type: String, maxLength: 255 },
    idCategory: { type: String, maxLength: 255 },
    idSupplier: { type: String, maxLength: 255 },
    dateAdded: { type: String, maxLength: 255 },
    manufacturingDate: { type: String, maxLength: 255 },
    expiryDate: { type: String, maxLength: 255 },
    imageList: { type: String, maxLength: 255 },
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
Product.plugin(AutoIncrement, { inc_field: 'idProduct' });
Product.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Product', Product);
