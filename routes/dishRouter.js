const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const dishhRouter = express.Router();


dishhRouter.use(bodyParser.json());

module.exports.init = function(passport){

    

    dishhRouter.route('/')
    .get((req,res,next) => {
        Dishes.find({})
        .then((dishes) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dishes);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        Dishes.create(req.body)
        .then((dish) => {
            console.log('Dish Created ', dish);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        Dishes.remove({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });
    
    
    //serving requests with params, based on:
    //https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4
    //http://expressjs.com/en/4x/api.html#router.route
    
    dishhRouter.param('dishId', (req, res, next, dishId) => {
        console.log("dishId = " + dishId);
        //do some custom stuff here...
        req.dishId = dishId;
        next();
    });
    
    dishhRouter.route('/:dishId')
    .get((req,res,next) => {
        Dishes.findById(req.dishId)
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/'+ req.dishId);
    })
    .put(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        Dishes.findByIdAndUpdate(req.dishId, {
            $set: req.body
        }, { new: true })
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .delete(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        Dishes.findByIdAndRemove(req.dishId)
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });
    
    
    //
    //comments management
    //
    
    dishhRouter.route('/:dishId/comments')
    .get((req,res,next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments);
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null) {
                dish.comments.push(req.body);
                dish.save()
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);                
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/'
            + req.params.dishId + '/comments');
    })
    .delete(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null) {
                for (var i = (dish.comments.length -1); i >= 0; i--) {
                    dish.comments.id(dish.comments[i]._id).remove();
                }
                dish.save()
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);                
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));    
    });
    
    
    dishhRouter.route('/:dishId/comments/:commentId')
    .get((req,res,next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments.id(req.params.commentId));
            }
            else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);            
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/'+ req.params.dishId
            + '/comments/' + req.params.commentId);
    })
    .put(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {
                if (req.body.rating) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.comment) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment;                
                }
                dish.save()
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);                
                }, (err) => next(err));
            }
            else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);            
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .delete(passport.authenticate('jwt', {session: false}), (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {
                dish.comments.id(req.params.commentId).remove();
                dish.save()
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);                
                }, (err) => next(err));
            }
            else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);            
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });    



}//module.exports.init



module.exports.router = dishhRouter;