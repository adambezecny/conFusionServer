var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/users');

var router = express.Router();
router.use(bodyParser.json());

module.exports.init = function(passport){

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/signup', (req, res, next) => {

  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      
      /*original:*/
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!!!'});
      });

      /*this is in doc:
      passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { 
          return next(new Error('Unable to retrieve user after signup!'));
         }

         req.logIn(user, (err) => {
          if (err) { return next(err); }
          console.log('Authentication after signup successfull');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });         

      })(req, res, next);*/
      
      

    }
  });
});

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});
});


router.get('/logout', (req, res, next) => {
  if(req.user){
    req.logout;//
    req.session.destroy();
    res.clearCookie('session-id');
    console.log('session discarded');
    res.redirect('/');
  }
  else {
    console.log('not logged in, nothing to do.');
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});  

}



module.exports.router = router;
