const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/lenpharmacy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log('connect successfuly!!!');
  } catch (e) {
    console.log('connect failure!!!');
  }
}

module.exports = { connect };
