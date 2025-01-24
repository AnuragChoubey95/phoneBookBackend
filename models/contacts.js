const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

const contactSchema = new mongoose.Schema({
  name: {
    type:String,
    minLength: 3,
    required: true,
  },
  number: {
    type:String,
    validate: {
      validator: (v) => {
        if (v.length < 8) {
          return false
        }
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number! Format must be XX-YYYYYYY or XXX-YYYYYYY.`,
    },
    required: true,
  }
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', contactSchema)