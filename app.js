const hpp = require('hpp');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Middlewares

//  Security HTTP Header
app.use(helmet());

//  Rate Limiting
const limiter = rateLimiter({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, Please try again an hour',
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Data Sanitization Against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization Against XSS
app.use(xss());

// Preventing Parameter Pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

//Serving statc Files
app.use(express.static(`${__dirname}/public`));
app.use('/api/v1/tours', tourRouter); // Mounting Router
app.use('/api/v1/users', userRouter); // Mounting Router

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
