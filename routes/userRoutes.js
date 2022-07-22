const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();
userRouter
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
//  router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter.post('/forgotPassword', authController.forgetPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

module.exports = userRouter;
