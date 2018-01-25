const express = require('express');
const bodyParser = require('body-parser');

const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());


promotionRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send all the promotions to you!');
})
.post((req, res, next) => {
    res.end('Will add the promotion: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;//403=operation not supported
    res.end('PUT operation not supported on /promotion');
})
.delete((req, res, next) => {
    res.end('Deleting all the promotions to you!');
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
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send details of the promotion: ' + req.promotionId + 'to you');
})
.post((req, res, next) => {
    res.statusCode = 403;//403=operation not supported
    res.end('POST operation not supported on /promotions/'+req.promotionId);
})
.put((req, res, next) => {
    res.write('Updating the promotion' + req.promotionId+'\n');
    res.end('Will update the promotion: ' + req.body.name+ ' with details ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting the promotion: '+req.promotionId);
});

module.exports = promotionRouter;