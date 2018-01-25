const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());


leaderRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send all the leaders to you!');
})
.post((req, res, next) => {
    res.end('Will add the leader: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;//403=operation not supported
    res.end('PUT operation not supported on /leader');
})
.delete((req, res, next) => {
    res.end('Deleting all the leaders to you!');
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
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send details of the leader: ' + req.leaderId + 'to you');
})
.post((req, res, next) => {
    res.statusCode = 403;//403=operation not supported
    res.end('POST operation not supported on /leaders/'+req.leaderId);
})
.put((req, res, next) => {
    res.write('Updating the leader' + req.leaderId+'\n');
    res.end('Will update the leader: ' + req.body.name+ ' with details ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting the leader: '+req.leaderId);
});

module.exports = leaderRouter;