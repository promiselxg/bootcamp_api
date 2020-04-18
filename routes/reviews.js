const express = require('express');
const {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews');

//  Review Model
const Review = require('../models/Review');

//  Router
const router = express.Router({
    mergeParams: true
});

//  AdvancedResult Middleware
const advancedResults = require('../middleware/advancedResult');

//  Protect and Authorize Middle Ware
const {
    protect,
    authorize
} = require('../middleware/auth');

//  Mount routes
router
    .route('/')
    .get(
        //  populate the reviews with bootcamp name and description
        advancedResults(Review, {
            path: 'bootcamp',
            select: 'name description'
        }),
        getReviews
    )
    .post(protect, authorize('user', 'admin'), addReview); //    protected route and only users and admin can write a review.

router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;