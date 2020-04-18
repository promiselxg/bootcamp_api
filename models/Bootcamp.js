const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder')
//const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters']
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  careers: {
    // Array of strings
    type: [String],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating must not be more than 10']
  },
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  housing: {
    type: Boolean,
    default: false
  },
  jobAssistance: {
    type: Boolean,
    default: false
  },
  jobGuarantee: {
    type: Boolean,
    default: false
  },
  acceptGi: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

// create bootcamp slug from the name
//we want this function to run b4 saving the records to the database, that is why we used the .pre function
//.post function is used incase u want the function to run after document has been saved
// we also used the normal function() call instead of arrow function because arrow function handles scope(this keyword) differently

BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    remove: /[*+~()'"!:@]/g,
    /* remove *+~.()'"!:@ from the result slug */
    lower: true, //lower case characters
    replacement: '_', // replace spaces with replacement character, defaults to `-`

  })
  next()
})

//Geocode & Create location field
BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address)
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetCode,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  }

  //do not save address in DB
  this.address = undefined;
  next()
})

//  Cascade delete courses when a bootcamp is deleted
//  NOTE: this Middleware CANNOT be triggered by [findByIdAndDelete] function INSTEAD we use the [findById]
BootcampSchema.pre('remove', async function (next) {
  console.log(`Courses beign removed from bootcam ${this._id}`)
  await this.model('Course').deleteMany({
    bootcamp: this._id
  }); //we want to make sure that the course been removed has the same id with the parent Bootcamp
  next();
})

//  Reverse populate with Virtuals = this takes two values 1. the field we want to add as virtual(can be anything) and 2. Options
BootcampSchema.virtual('courses', {
  ref: 'Course', //reference to the model
  localField: '_id', //local Field
  foreignField: 'bootcamp', //foreign field ( field in the course model)
  justOne: false // we want the array for each bootcamp
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);