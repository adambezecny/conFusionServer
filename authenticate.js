var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config.js');
const Dishes = require('./models/dishes');

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
}

module.exports.customAuthentication = function(passport, options) {
    
    return function(req, res, next){
        
        if(options.allowAnonymous == 'true'){
            console.log('allowing anonymous access to route');
            next();
        }else{

            passport.authenticate('jwt', {session: false}, (err, user, info) => {

                console.log('performing custom authentication callback...');

                if (err)  
                    return next(err); 
                
                if (!user)  
                    return next(new Error('User does not exist!')); 
                
                if(options.allowAdminOnly == 'true')
                    if(user.admin == false)
                        return next(new Error('User is not admin!')); 
                
                if(options.checkCommentAccess == 'true'){
                    console.log('checking rights to modify comment...');
                    var reqCommentId = req.params.commentId;
                    var reqDishId    = req.params.dishId;
                    var userId       = user.id;

                    Dishes.findById(reqDishId)
                    .then((dish) => {
                        var objComment = dish.comments.id(reqCommentId);
                        var commentAuthor = objComment.author;
                        console.log('commentAuthor='+commentAuthor.toString()+' user performing action='+user);
                        if(commentAuthor.toString() != user.id){
                             console.log("User not an owner of modified comment!");   
                             return next(new Error("User not an owner of modified comment!"));   
                        }else{
                            console.log("User is an owner of modified comment, allowing modification");   
                            next();
                        }

                    }, (err) => next(err))
                    .catch((err) => next(err));         
                                   

                }else{
                    console.log('all good here...');
                    next();//all good, user is authenticated at this point!
                }

            })(req, res, next);
        }
    }

}