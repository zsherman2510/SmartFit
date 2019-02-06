const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// creates schema

const ClientSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId
  },
  handle: {
    type: String,
    max: 40
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    data: Buffer
  },
  date: {
    type: Date,
    default: Date.now
  },
  age: {
    type: Number
  },
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  location: {
    type: String
  },
  goals: {
    type: String
  },
  social: {
    instagram: {
      type: String
    },
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    linkedIn: {
      type: String
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Client = mongoose.model('client', ClientSchema);
