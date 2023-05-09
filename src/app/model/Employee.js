const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const Employee = new Schema(
  {
    idEmployee: { type: String, maxLength: 255 },
    name: { type: String, maxLength: 255 },
    dateOfBirth: { type: String, maxLength: 255 },
    gender: { type: String, maxLength: 255 },
    phoneNumber: { type: String, maxLength: 255 },
    email: { type: String, maxLength: 255 },
    address: { type: String, maxLength: 600 },
    avatar: { type: String, maxLength: 255 },
    status: { type: Number },
    idAccount: { type: Number },
    dateStartWork: { type: String, maxLength: 255 },
    position: { type: String, maxLength: 255 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
Employee.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Employee', Employee);
