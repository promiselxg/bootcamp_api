const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/users');

//  User Model
const User = require('../models/User');

//  Express Router
const router = express.Router({
    mergeParams: true
});

//  AdvancedResult Middleware
const advancedResults = require('../middleware/advancedResult');

//  protect and authorize Middleware
const {
    protect,
    authorize
} = require('../middleware/auth');

//  to access anything below this 
//  1. you must be authorized (thats what the authorize middleware handles)
router.use(protect);
router.use(authorize('admin'));

//  Routes
router
    .route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;