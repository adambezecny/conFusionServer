const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Promotions = require('../models/promotions');
const auth = require('../authenticate').customAuthentication;
const promotionRouter = express.Router();
promotionRouter.use(bodyParser.json());

module.exports.init = function(passport){

    promotionRouter.route('/')
    .get(auth(passport, {"allowAnonymous": "true"}), (req,res,next) => {
        Promotions.find({})
        .then((promotions) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        Promotions.create(req.body)
        .then((promotion) => {
            console.log('Promotion Created ', promotion);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        Promotions.remove({})
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
    
    promotionRouter.param('promotionId', (req, res, next, promotionId) => {
        console.log("promotionId = " + promotionId);
        //do some custom stuff here...
        req.promotionId = promotionId;
        next();
    });
    
    promotionRouter.route('/:promotionId')
    .get(auth(passport, {"allowAnonymous": "true"}), (req,res,next) => {
        Promotions.findById(req.promotionId)
        .then((promotion) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /promotions/'+ req.promotionId);
    })
    .put(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        Promotions.findByIdAndUpdate(req.promotionId, {
            $set: req.body
        }, { new: true })
        .then((promotion) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .delete(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        Promotions.findByIdAndRemove(req.promotionId)
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });    

}



module.exports.router = promotionRouter;