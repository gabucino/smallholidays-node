const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    googleId: String,
    email: {
      type: String,
      unique: true,
    },
    role: {
      type: String,
      default: 'employee',
    },
    firstName: {
      type: String
    },
    requests: [
      {
        requestType: { type: String, required: true  },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)

