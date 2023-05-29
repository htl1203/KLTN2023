const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect('mongodb+srv://tlinh6005:12032001Lan@cluster0.5inheza.mongodb.net', {
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
