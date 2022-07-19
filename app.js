const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
// Middlewares
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));
app.use('/api/v1/tours', tourRouter); // Mounting Router
app.use('/api/v1/users', userRouter); // Mounting Router

app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'failed',
        message: `Can't find ${req.originalUrl}`,
    });
    next();
});

module.exports = app;
