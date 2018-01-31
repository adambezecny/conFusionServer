var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');

module.exports = function(passport){
    passport.use(
        new LocalStrategy(
            
            User.authenticate()
        )
    );
    
        
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser()); 
    
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

