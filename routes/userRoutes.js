const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

// Authentication
userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.post('/forgotPassword', authController.forgetPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

// This is sheild
userRouter.use(authController.protect);
userRouter.patch('/updatePassword', authController.updatePassword);
userRouter.get('/me', userController.getMe, userController.getUser);
userRouter.patch('/updateMe', userController.updateMe);
userRouter.delete('/deleteMe', userController.deleteMe);

userRouter.use(authController.restrictTo.bind(['admin']));
userRouter.route('/').get(userController.getAllUsers);
userRouter
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = userRouter;
