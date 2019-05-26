const express = require('express');
const router = express.Router(); 
const Product = require('../models/product')
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true)
    } else {
    cb(null, false)
    }
}
const upload = multer({
    storage : storage, 
    limits : {
    fileSize: 1024 * 1024 * 5
    },
    fileFilter : fileFilter
});

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            const response = {
                count : doc.length,
                products : doc.map(doc => {
                    return {
                        name : doc.name, 
                        price : doc.price,
                        productImage : doc.productImage,
                        _id : doc._id,
                        request : {
                            type : 'GET',
                            url : 'http://localhost:3000/products/' + doc._id
                           }
                       }
                   })
               };
               
            res.status(200).json(response);
           
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            });
        })

});

router.post('/', upload.single('productImage'), (req, res, next) => {
    const product = new Product({
        _id : mongoose.Types.ObjectId(),
        name : req.body.name,
        price : req.body.price,
        productImage : req.file.path
    });
    product
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created product successfully',
                product: {
                    name: result.name,
                    price: result.price,
                    id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        })
        .catch(err => console.log(err));
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if(doc){
            res.status(200).json({
                product : doc,
                request : {
                    type : 'GET',
                    url : 'http://localhost3000/products'

                }
            });
            } else {
                res.status(400).json({
                    message : " no valid entry found for the provided ID"
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error : err});
        });
});

router.patch('/:productId', (req, res) => {
    const id = req.params.productId;
    const updateObject = req.body
    Product.update({_id : id}, {$set : updateObject})
        .exec()
        .then(result => {
            console.log(res);
            res.status(200).json({
                message : 'product updated',
                request : {
                    type : 'GET',
                    url : 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            });
        });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id : id}).exec()
        .then(result => {
            res.status(200).json({
                message : 'product deleted',
                request : {
                    type : 'POST',
                    url: 'http://localhost:3000/products/',
                    body : {name : String, price : Number}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            })
        });
});

module.exports = router;
