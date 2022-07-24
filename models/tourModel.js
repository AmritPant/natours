const mongoose = require('mongoose');
const slugify = require('slugify');

const toursSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a Name'],
            unique: true,
            trim: true,
            maxLength: [
                40,
                'A tour name must have less or equal then 40 characters',
            ],
            minLength: [
                10,
                'A tour name must have more or equal then 10 characters',
            ],
        },
        slug: {
            type: String,
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
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 0,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be belo 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A Tour must have a Price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this only points to current doc on NEW document creation
                    return val < this.price;
                },
                message:
                    'Discount Price ({VALUE}) should be below regular Price',
            },
        },
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
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocaton: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number], // longitude, latitude
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                address: String,
                description: String,
            },
        ],
        guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

toursSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual Populate
toursSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// 4 types of middleware

// Document Middleware, it runs before .save() and .create() but not .insertMany()
toursSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

//  JUST FOR TEST --
// toursSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(
//         async _id => await User.findById(_id)
//     );
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

//  QUERY MIDDLEWARE
toursSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

toursSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v  -passwordChangedAt',
    });

    next();
});

toursSchema.post(/^find/, function () {
    console.log(`The query took ${Date.now() - this.start}ms`);
});

// AGGREGATION MIDDLEWARE
toursSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
