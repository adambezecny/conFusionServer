const express = require('express');
const bodyParser = require('body-parser');

const dishhRouter = express.Router();

dishhRouter.use(bodyParser.json());


dishhRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send all the dishes to you!');
})
.post((req, res, next) => {
    res.end('Will add the dish: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;//403=operation not supported
    res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {
    res.end('Deleting all the dishes to you!');
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
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send details of the dish: ' + req.dishId + 'to you');
})
.post((req, res, next) => {
    res.statusCode = 403;//403=operation not supported
    res.end('POST operation not supported on /dishes/'+req.dishId);
})
.put((req, res, next) => {
    res.write('Updating the dish'+req.dishId+'\n');
    res.end('Will update the dish: '+req.body.name+ ' with details ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting the dish: '+req.dishId);
});

module.exports = dishhRouter;