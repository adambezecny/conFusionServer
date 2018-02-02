var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/users');

var router = express.Router();
router.use(bodyParser.json());

var getToken = require('../authenticate').getToken;
const auth = require('../authenticate').customAuthentication;

module.exports.init = function(passport){

/* GET users listing. */
router.get('/', auth(passport, {"allowAdminOnly": "true"}), function(req, res, next) {
  User.find({})
  .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
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
      
      if(req.body.firstname)
        user.firstname = req.body.firstname;

      if(req.body.lastname)
        user.lastname = req.body.lastname;
      
        user.save((err, user) => {

            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
              return ;
            }          

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

        });
    }
  });
});

router.post('/login', passport.authenticate('local', { session: false }), (req, res, next) => {
  console.log("getting authentication token...");
  var token = getToken({_id: req.user._id});
  console.log("authentication token is: "+token);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
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
