const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Leaders = require('../models/leaders');
const auth = require('../authenticate').customAuthentication;

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

module.exports.init = function(passport){

    leaderRouter.route('/')
    .get(auth(passport, {"allowAnonymous": "true"}), (req,res,next) => {
        Leaders.find({})
        .then((leaders) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leaders);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        Leaders.create(req.body)
        .then((leader) => {
            console.log('Leader Created ', leader);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /leaders');
    })
    .delete(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        Leaders.remove({})
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
    
    leaderRouter.param('leaderId', (req, res, next, leaderId) => {
        console.log("leaderId = " + leaderId);
        //do some custom stuff here...
        req.leaderId = leaderId;
        next();
    });
    
    leaderRouter.route('/:leaderId')
    .get(auth(passport, {"allowAnonymous": "true"}), (req,res,next) => {
        Leaders.findById(req.leaderId)
        .then((leader) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /leaders/'+ req.leaderId);
    })
    .put(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        Leaders.findByIdAndUpdate(req.leaderId, {
            $set: req.body
        }, { new: true })
        .then((leader) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .delete(auth(passport, {"allowAdminOnly": "true"}), (req, res, next) => {
        Leaders.findByIdAndRemove(req.leaderId)
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });
    

}



module.exports.router = leaderRouter;