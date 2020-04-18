const express = require('express');
const {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');

//  course model
const Course = require('../models/Course');

//  AdvancedResult
const advancedResults = require('../middleware/advancedResult')

//  Express Router
const router = express.Router({
    mergeParams: true
});

//  Protect Middleware
const {
    protect,
    authorize
} = require('../middleware/auth')


//we are using margeParams the URL params /courses & /bootcampID/courses

router.route('/')
    .get(
        advancedResults(Course, {
            path: 'bootcamp',
            select: 'name description'
        }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse);

router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;