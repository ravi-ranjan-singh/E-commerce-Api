const express = require('express');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const productRouter = require('./routes/productRouter')
const customerRouter = require('./routes/customerRouter')
const reviewRouter = require('./routes/reviewRouter')
const cartRouter = require('./routes/cartRouter')

const app = express();

app.use(helmet())

const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: `Too many request from your IP. Please try in an hour`
})

app.use('/api', limiter)
app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize())
app.use(xss())
app.use(hpp())

app.use('/api/products', productRouter)
app.use('/api/customers', customerRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/cart', cartRouter)


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
