const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('unhandledRejection', err => {
    console.log(err.message);
    console.log('UNAHNDLER REJECTION! Shutting down...');
    process.exit(1);
});

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION! Shutting down...');

    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log(`DB Connection Sucessfull`));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App Running on Port ${port}`);
});
