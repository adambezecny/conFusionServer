var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');

module.exports = function(passport){
    //local strategy is used by users.js router only
    passport.use(
        new LocalStrategy(
            User.authenticate()
        )
    );
    
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secretKey;
    
    //token strategy should be used by all the other routes(dishRouter.js, etc...)
    passport.use(new JwtStrategy(opts,
        (jwt_payload, done) => {
            console.log("JWT payload: ", jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                else if (user) {
                    return done(null, user);
                }
                else {
                    return done(null, false);
                }
            });
        }));
        

     //not needed any more, we are not using sessions   
    //passport.serializeUser(User.serializeUser());
    //passport.deserializeUser(User.deserializeUser()); 
    
    // used to serialize the user for the session
    //passport.serializeUser(function(user, done) {
    //    done(null, user.id);
    //});


    // used to deserialize the user
    //passport.deserializeUser(function(id, done) {
    //    User.findById(id, function(err, user) {
    //        done(err, user);
    //    });
    //});
}

module.exports.getToken = function(user) {
    return jwt.sign(
        user, 
        config.secretKey,  
        {expiresIn: 3600}
    );
};