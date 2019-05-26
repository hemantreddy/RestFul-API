const express = require('express')
const app = express(); 
const morgan = require('morgan'); 
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');

const productsRouter = require('./api/routes/products');
const ordersRouter = require('./api/routes/orders');
const userRouter = require('./api/routes/users')

mongoose.connect('mongodb+srv://'+ process.env.MONGO_ATLAS_PW +':hemant@node-rest-shop-iqovk.mongodb.net/test?retryWrites=true', {
    useNewUrlParser : true
})

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended : false
}))
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT', 'POST', 'PATCH', 'DELETE', 'GET');
        return res.status(200).json({});
    }
    next();
})

app.use('/uploads', express.static('uploads'))
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 400; 
    next(error); 
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            msg : error.message
        }
    });
});


module.exports = app; 