// config/passport.js

// load all the things we need
let LocalStrategy   = require('passport-local').Strategy;

// load up the user model
const User = require('../app/models/User');
//let iconicMoment = require('../app/models/iconicMoment');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(async function(id, done) {
    try {  
        let user =  await User.findById(id);
        done(null,user)
        } catch (err){
            done(err)
        }

    })
 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    async function(req, email, password, done) {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
       try { 
        let user = await User.findOne({ 'local.email' :  email }) 
            // if there are any errors, return the error
            
            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            }
            //Two roles only

            const role = req.body.role === 'organization' ? 'organization' : 'volunteer';
            
            

				// if there is no user with that email
                // create the user
                let newUser = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model
                newUser.role = role;
                if (req.body.name) newUser.name = req.body.name;
				// save the user
               await newUser.save()
                    
                    return done(null, newUser);
            
            }catch (err){
                return done(err)
            }

        

    }));

    // =========================================================================
    // Volunteer LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    function loginBy(role,flashKey){
       return new LocalStrategy({
         usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    async function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        try {
        let user = await User.findOne({ 'local.email' :  email })
            // if there are any errors, return the error before anything else

            // if no user is found, return the message

            if (!user || !user.validPassword(password))
                return done(null, false, req.flash(flashKey, 'Wrong user or password.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (user.role !== role){
                const other = role === 'volunteer' ? 'organization' : 'volunteer';
                return done(null,false, req.flash(flashKey,`This is an ${other} account. Use the other login`))
            }
               
// all is well,//  return successful user  
                                    return done(null, user);
        } catch(err){
            return done(err);
        }
    });
    }
passport.use('volunteer-login',loginBy('volunteer','volunteerLoginMessage'))
passport.use('organization-login',loginBy('organization','organizationLoginMessage'))
}
