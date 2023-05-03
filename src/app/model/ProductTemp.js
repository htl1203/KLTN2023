const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const ProductTemp = new Schema(
  {
    idProduct: { type: Number },
    name: { type: String, maxLength: 255 },
    idCategory: { type: String, maxLength: 255 },
    idReceipt: { type: Number },
    dateAdded: { type: String, maxLength: 255 },
    manufacturingDate: { type: String, maxLength: 255 },
    expiryDate: { type: String, maxLength: 255 },
    imageList: { type: String, maxLength: 255 },
    importPrice: { type: Number },
    salePrice: { type: Number },
    format: { type: String, maxLength: 255 },
    packingForm: { type: String, maxLength: 255 },
    uses: { type: String, maxLength: 255 },
    component: { type: String, maxLength: 255 },
    specified: { type: String, maxLength: 255 },
    antiDefinition: { type: String, maxLength: 255 },
    dosage: { type: String, maxLength: 255 },
    sideEffects: { type: String, maxLength: 255 },
    careful: { type: String, maxLength: 255 },
    preserve: { type: String, maxLength: 255 },
    trademark: { type: String, maxLength: 255 },
    origin: { type: String, maxLength: 255 },
    quality: { type: Number },
    sold: { type: Number },
    retailQuantity: { type: Number },
    quantityPerBox: { type: Number },
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
ProductTemp.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('ProductTemp', ProductTemp);
