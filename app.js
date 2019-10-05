// Load modules
const express = require('express');
const expressLayouts= require('express-ejs-layouts');
const path=require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


// Connect to MongoURI exported from external file
const keys = require('./config/keys');
const User = require('./models/user');

//Link Passports to the Server
require('./passport/google-passport');
require('./passport/facebook-passport');

// initialize application
const app = express();


// Express config
 app.use(cookieParser());

 app.use(bodyParser.urlencoded({
     extended: false
 }));

 app.use(bodyParser.json());

 app.use(session({
     secret: 'keyboard cat',
     resave: true,
     saveUninitialized: true
 }));


 app.use(passport.initialize());
 app.use(passport.session());

 //Global variables for users

 app.use((req,res,next)=>{
 res.locals.user=req.user || null;
 next();
 });


//Setting up the template
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

// setup static file to serve css, javascript and images
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));


// connect to remote database
mongoose.promise=global.Promise;
mongoose.connect(keys.MongoURI, {
    useNewUrlParser: true,useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to Remote Database....');
}).catch((err) => {
    console.log(err);
});
// set environment variable for port
const port = process.env.PORT || 3000;
// Handle routes
app.get('/', (req, res) => {
    res.render('main');
});

app.get('/about', (req, res) => {
    res.render('about');
});


// GOOGLE AUTH ROUTE
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    });


    //Facebook Auth Route
app.get('/auth/facebook',
  passport.authenticate('facebook',{
      scope:'email'
  }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res)=> {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });
 
  //Profile Route
app.get('/profile', (req, res) => {
   
    User.findById({_id:req.user._id})
    
    .then((user)=>{
        res.render('profile',{
            user:user
        });
    })
   
});

//Handle User Logout

app.get('/logout',(req,res)=>{
req.logout();
res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});