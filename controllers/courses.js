const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')

// @desc    Get Courses
// @route   Get /api/v1/bootcamps/:bootcampId/courses
// @access  Public 
exports.getCourses = asyncHandler(async (req, res, next) => {
    //check if link contains a bootcamp Id
    if (req.params.bootcampId) {
        //build query string using the bootcampId
        const courses = await Course.find({
            bootcamp: req.params.bootcampId
        });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        //build query string
        //  OPTION 1. Add extra information using .populate() function [Course.find().populate('bootcamp');]
        //  OPTION 2. Select specific fields to populate 
        /* query = Course.find().populate({
             path: 'bootcamp',
             select: 'name description'
         });
         */
        res.status(200).json(res.advancedResults);
    }
});

// @desc    Get Single Course
// @route   Get /api/v1/course/:id
// @access  Public 
exports.getCourse = asyncHandler(async (req, res, next) => {
    //  Query DB and populate by bootcamp name and description 
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    // check if course ID exist
    if (!course) {
        return next(new ErrorResponse(`No Course with the ID of ${req.params.id}`), 404);
    }


    //  Return response to calling APP
    res.status(200).json({
        success: true,
        data: course
    });
})
// @desc    Add a Course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    //  Get bootcamp ID
    req.body.bootcamp = req.params.bootcampId;

    //  Get Logged In User ID
    req.body.user = req.user.id;

    //  Query DB and populate by bootcamp name and description 
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    // check if course ID exist
    if (!bootcamp) {
        return next(new ErrorResponse(`No Course with the ID of ${req.params.bootcampId}`), 404);
    }

    //  Make sure logged User == POST author && logged in USER !== ADMIN
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`ACCESS DENIED : you are not permitted to perform this Action`, 401));
    }

    //  Create New Course
    const course = await Course.create(req.body);

    //  Return response to calling APP
    res.status(200).json({
        success: true,
        data: course
    });
});
// @desc    Update Course
// @route   PUT /api/v1/course/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    //  Query DB and populate by bootcamp name and description 
    let course = await Course.findById(req.params.id)

    // check if course ID exist
    if (!course) {
        return next(new ErrorResponse(`No Course with the ID of ${req.params.id}`), 404);
    }

    //  Update Course
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //returns new value
        runValidators: true
    });

    //  Return response to calling APP
    res.status(200).json({
        success: true,
        data: course
    });
});
// @desc    Delete Course
// @route   DELETE /api/v1/course/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    //  Query DB and populate by bootcamp name and description 
    const course = await Course.findById(req.params.id)

    // check if course ID exist
    if (!course) {
        return next(new ErrorResponse(`No Course with the ID of ${req.params.id}`), 404);
    }

    //  Remove Course
    await course.remove();
    const msg = "This course has been successfully deleted";

    //  Return response to calling APP
    res.status(200).json({
        success: true,
        data: msg
    });
});