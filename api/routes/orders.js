const express = require('express');
const router = express.Router();
const Order = require('../models/order')
const mongoose = require('mongoose');
const Product = require('../models/product')

//GET REQUESTS TO ORDERS
router.get('/', (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count : docs.length,
                orders : docs.map(doc => {
                    return {
                        _id : doc._id,
                        product : doc.product,
                        quantity : doc.quantity,
                        request : {
                            type : 'GET',
                            url : 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error : err
            });
        });
});

//ADD / RECEIVE ORDERS
router.post("/", (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save();
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Order stored",
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: "GET",
                    url: "http://localhost:3000/orders/" + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// FETCH A PARTICULAR ORDER DETAILS
router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product')
        .exec()
        .then(order => {
            if(!order){
                return res.status(500).json({
                    message : 'order not found'
                })
            }
            res.status(200).json({
                order : order,
                request : {
                    type : 'GET',
                    url : 'http://localhost:3000/orders'
                }
            }) 
            
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
    });


//DELETE AN ORDER
router.delete('/:orderId', (req, res, next) => {
    id = req.params.orderId;
    Order.deleteOne({_id : id})
        .exec()
        .then(result => {
            res.status(200).json({
                message : 'order deleted',
                orderId : id
            })
        })
        .catch(err => {
            res.status(500).json({
                error : err
            })
        })
});

module.exports = router;