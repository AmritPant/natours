const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a Name'],
        unique: true,
        trim: true,
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a Difficulty'],
    },
    ratingsAverage: {
        type: Number,
        default: 0,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A Tour must have a Price'],
    },
    priceDiscout: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'A Tour must have a Summary'],
    },
    descirption: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A Tour must have a images'],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false,
    },
    startDates: [Date],
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
