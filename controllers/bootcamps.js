const path = require('path')
const ErrorResponse = require('../utils/errorResponse') //custom error handler
const asyncHandler = require('../middleware/async') //custom async function
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp') //Bootcamp Model

// @desc    Get all Bootcamps
// @route   Get /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    //  Middleware Handling this route located in middleware/advancedResult
    //  response status
    res.status(200).json(res.advancedResults)
});

// @desc    Get a single  Bootcamps
// @route   Get /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    // sends response to ./routes/bootcamp

    const bootcamp = await Bootcamp.findById(req.params.id)
    //check if Boot camp exist with this ID
    if (!bootcamp) {
        return next(new ErrorResponse(`We couldnt find a bootcamp with this ID ${req.params.id}`, 404))
    }
    res.status(200).json({
        success: true,
        data: bootcamp
    })

});

// @desc   Create New Bootcamps
// @route   Get /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    //  Add User to req.body
    req.body.user = req.user.id;

    //  Check for Published Bootcamp
    const publishedBootcamp = await Bootcamp.find({
        user: req.user.id
    }) //gets all bootcamp created by this user

    //  Check if Bootcamp/Post Publisher is Not the Admin
    if (publishedBootcamp && req.user.role !== 'admin') {
        //  Check if this User has reached the Maximum number of Post/Bootcamp Permitted to Publish.
        //Publisher Can Only Make a Maximum of 5 Post
        if (publishedBootcamp.length >= 5) {
            console.log(publishedBootcamp.length)
            return next(new ErrorResponse(`You have reached the maximum number of Post or Bootcamp Permitted for this account`, 400));
        }
    }

    // sends response to ./routes/bootcamp
    const bootcamp = await Bootcamp.create(req.body)
    res.status(200).json({
        success: true,
        data: bootcamp
    })
});

// @desc    Update single  Bootcamps
// @route   Get /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    // Get this Bootcamp ID
    let bootcamp = await Bootcamp.findById(req.params.id);
    //  check if value exist
    if (!bootcamp) {
        return next(new ErrorResponse(`Unable to Update this resource with ID : ${req.params.id}`, 404));
    }

    //  Make sure logged User == POST author && logged in USER !== ADMIN
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`ACCESS DENIED : you are not permitted to perform this Action`, 401));
    }

    //  Update Record
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });


    //everything went well
    res.status(200).json({
        success: true,
        data: bootcamp
    })
});

// @desc    Delete a single  Bootcamps
// @route   Get /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    // Get this Bootcamp ID
    const bootcamp = await Bootcamp.findById(req.params.id);

    //check if record exist
    if (!bootcamp) {
        return next(new ErrorResponse(`This Resource Does not Exist`, 404));
    }

    //  Make sure logged User == POST author && logged in USER !== ADMIN
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`ACCESS DENIED : you are not permitted to perform this Action`, 401))
    }

    // Remove Bootcamp Post
    bootcamp.remove();

    //everything went well
    res.status(200).json({
        success: true,
        data: "This record has been successfully removed."
    })
});

// @desc    Get bootcamps within a radius
// @route   Get /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {
        zipcode,
        distance
    } = req.params

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    // query DB using the Lat, Lng and Radius
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

// @desc    Upload Photo for Bootcamp
// @route   Get /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    //  Query DB to see if ID exists
    const bootcamp = await Bootcamp.findById(req.params.id);

    //check if record exist
    if (!bootcamp) {
        return next(new ErrorResponse(`This Resource Does not Exist`, 404))
    }

    //  Make sure logged User == POST author && logged in USER !== ADMIN
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`ACCESS DENIED : you are not permitted to perform this Action`, 401))
    }

    //  check if a file was selected
    if (!req.files) {
        return next(new ErrorResponse(`Please Choose A File`, 400));
    }

    //  Create Variable
    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
                400
            )
        );
    }

    //  Create Custom Filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    //  Move Uploaded file
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`ERROR OCCURED : Image upload Failed`, 500));
        }
        //  Insert File to DB
        await Bootcamp.findByIdAndUpdate(req.params.id, {
            photo: file.name
        });
        //  Send Back response
        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});