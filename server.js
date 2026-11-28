require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const passport= require('passport')
const cors = require('cors')
const PORT = process.env.PORT || 8080
const Place = require('./app/models/Places')
const Event = require('./app/models/Event')
const User = require('./app/models/User')
// const Volunteer = require('./app/models/Volunteer')
// const Organization = require('./app/models/Organization')
require('./config/passport')(passport)


const uri = process.env.MONGODB_URI;


mongoose.connect(uri)
.then(data => {
    console.log('connected to the database')


app.listen(process.env.PORT || PORT, ()=>{
    console.log(`The server is now running on port ${PORT}! Betta Go Catch It!`)
    })
})

app.use(cors())
//parses incoming data from the form in my ejs
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(express.json())
app.use(session({
    secret:'me',
    resave:true,
    saveUninitialized:true
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.set('view engine', 'ejs'); // set up ejs for templating
app.locals.mapsKey = process.env.GOOGLE_MAPS_KEY;
app.use((req,res,next)=>{
    res.locals.user=req.user
    next()
})

function requireRole(role){
    return (req,res,next)=> {
        if (req.user && req.user.role === role) return next()
            res.redirect('/portal')
    }
}

app.get('/',isLoggedIn, async(req,res)=>{
    const zip = (req.query.zip || '').trim()
  try {  
    const today = new Date(); today.setHours(0,0,0,0)
    let events = await Event.find({date:{$gte:today}})
    .sort({date:1})
    .populate('placeId')
    .populate('orgId','name')
    if (zip) events = events.filter(e => e.placeId && e.placeId.zip === zip)
    res.render('index',{events,zip,message:req.flash('feedMessage')})
  }catch(err){
    console.log(err)
        console.error(err)
        res.render('index', {events: [], zip,message: ['Events are not loading correctly']})
    
  }
})

app.get('/organization',isLoggedIn,requireRole('organization'),async(req,res)=>{
    let places = 
    await Place.find({ownerId:req.user._id}).sort({name:1})
    if(places.length === 0) places = await Place.find().sort({name:1})
 const myEvents = 
await Event.find({orgId:req.user._id}).sort({date:1}).populate('placeId').populate('signups','name')
    res.render('organizationPortal.ejs',{places,myEvents, message:req.flash('eventMessage')})
})

app.get('/api/places',async (req,res) => {
   try{
    const places = await Place.find({},'name type kind address zip lat lng hours phone')
    res.json(places)
   }
   catch(err){
    console.log(err)
    res.status(500).json({error:'Places unable to load'})
   }
// res.render('index', {
//         mapsKey:process.env.GOOGLE_MAPS_KEY,Place
//     })
})
app.post('/events',isLoggedIn,requireRole('organization'),async (req,res)=> {
            try{
                await Event.create({
                    title:req.body.event,
                    description:req.body.description,
                    date:req.body.eventDate,
                    startTime:req.body.startTime,
                    endTime:req.body.endTime,
                    spots:req.body.volunteersNeeded,
                    skills:(req.body.skills || '').split(',').map(s=> s.trim()).filter(Boolean),
                    placeId:req.body.placeId,
                    orgId:req.user._id,
                })
            
            res.redirect(req.user.role === 'organization' ? '/organization' : '/volunteer')
        } catch(err){
            console.error(err)
            req.flash('eventMessage', 'Cold not post event. Check the event details')
            res.redirect('/organization')
        }
    })

    app.get('/api/events',async (req,res)=> {
            try{
                const today = new Date(); today.setHours(0,0,0,0)
                const events = await Event.find({date:{$gte:today}}).sort({date:1}).populate('placeId')
                res.json(events.filter(e=>e.placeId).map(e=> ({
                    id:e._id,
                    title:e.title,
                    date:e.date,
                    startTime:e.startTime,
                    endTime:e.endTime,
                    spotsLeft:e.spots - e.signups.length,
                    placeName:e.placeId.name,
                    address:e.placeId.address,
                    lat:e.placeId.lat,
                    lng:e.placeId.lng,
                })))
            } catch(err){
                console.error(err)
                res.status(500).json({error:'No events are loading'})
            }
        })

    app.post('/events/:id/delete',isLoggedIn,requireRole('organization'),async(req,res)=> {
        await Event.deleteOne({_id: req.params.id,orgId:req.user._id})
        res.redirect('/organization')
    })


    app.post('/events/:id/signup',isLoggedIn,requireRole('volunteer'),async(req,res)=> {
        try{
        let signupInfo = await Event.updateOne(
            {
            _id: req.params.id,
            signups:{$ne:req.user._id},
            $expr:{$lt:[{$size:'$signups'},'$spots']},
            
            },
            {$push:{signups:req.user._id}}

        )
        req.flash('feedMessage', signupInfo.modifiedCount ? "You have already signed up!" : 'Signups are filled or you already signed up.')
    } catch(err){
        console.log(err)
        req.flash('feedMessage','Could not sign up.Try again')
    }
        res.redirect('/volunteer')
    })

    app.post('/events/:id/edit',isLoggedIn,requireRole('organization'), async(req,res)=> {
        await Event.updateOne(
            { _id:req.params.id, orgId:req.user._id},
            {$set:{
                date:req.body.eventDate,
                startTime:req.body.startTime,
                spots:req.body.volunteersNeeded
            }}
        )
        res.redirect('/organization')
    })

app.post('/events/:id/cancel',isLoggedIn,requireRole('volunteer'),async(req,res)=> {
        try{
        await Event.updateOne(
            {_id: req.params.id},
            {$pull:{signups:req.user._id}}
           )
        req.flash('feedMessage','Your signup has been cancelled')
    } catch(err){
        console.log(err)
    }
        res.redirect('/volunteer')
    })





// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { 
            role:req.query.role === 'organization' ? 'organization' : 'volunteer',
            message:[...req.flash('volunteerMessage'),...req.flash('organizationLoginMessage')]  
            });
        });

        // process the login form
        app.post('/login',(req,res,next) => {
            const role = req.body.role === 'organization' ? 'organization' : 'volunteer'
            passport.authenticate(`${role}-login`,{
            successRedirect : '/portal', // redirect to the secure profile section
            failureRedirect : `/login?role=${role}`, // redirect back to the signup page if there is an error
            failureFlash:true,
         })(req,res,next);
        })

        // app.post('/login/volunteer', passport.authenticate('volunteer-login', {
        //     successRedirect : '/volunteer', // redirect to the secure profile section
        //     failureRedirect : '/login', // redirect back to the signup page if there is an error
        //     failureFlash : true // allow flash messages
        // }));

        // app.post('/login/organization', passport.authenticate('organization-login', {
        //     successRedirect : '/organization', // redirect to the secure profile section
        //     failureRedirect : '/login', // redirect back to the signup page if there is an error
        //     failureFlash : true // allow flash messages
        // }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/portal', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // app.get('/organization', function(req, res) {
        //     res.render('organizationPortal.ejs', { message: req.flash('signupMessage') });
        // });

        // save the volunteer's profile info from the form on the volunteer portal
        const toList = s => (s || '').split(',').map(x => x).filter(Boolean)

        app.post('/volunteerInfo', isLoggedIn, requireRole('volunteer'), async (req, res) => {
                req.user.name = req.body.volunteerName
                req.user.jobTitle = req.body.title
                req.user.interests = toList(req.body.interests)
                req.user.skills = toList(req.body.skills)
                req.user.description = req.body.description
                await req.user.save()
                req.flash('feedMessage', 'Profile saved')
            
            res.redirect('/volunteer')
        })

        app.get('/volunteer',isLoggedIn, requireRole('volunteer'),async(req, res)=> {
    const myShifts= await Event.find({signups:req.user._id}).sort({date:1}).populate('placeId')

            res.render('volunteerPortal.ejs', { message: req.flash('feedMessage'),myShifts});
        });


        app.get('/portal',isLoggedIn,(req,res)=> {
            
            res.redirect(req.user.role === 'organization' ? '/organization' : '/volunteer')
        })


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');

}

