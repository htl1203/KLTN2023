const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const Customer = new Schema(
  {
    idCustomer: { type: Number },
    name: { type: String, maxLength: 255 },
    dateOfBirth: { type: String, maxLength: 255 },
    phoneNumber: { type: String, maxLength: 255 },
    email: { type: String, maxLength: 255 },
    gender: { type: String, maxLength: 255 },
    avatar: { type: String, maxLength: 255 },
    address: { type: String, maxLength: 255 },
    status: { type: Number },
    idAccount: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
Customer.plugin(AutoIncrement, { inc_field: 'id' });
Customer.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Customer', Customer);
