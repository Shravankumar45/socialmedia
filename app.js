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
const Post = require('./models/post');

//Link Passports to the Server
require('./passport/google-passport');
require('./passport/facebook-passport');
require('./passport/instagram-passport');
 
//Link Helpers

const {
    ensureAuthentication,
    ensureGuest
}=require('./helpers/auth');
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
app.get('/',ensureGuest,(req, res) => {
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
      scope:['email']
  }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res)=> {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });
 
  //Handle Instagram Auth ROUTE

  app.get('/auth/instagram',
  passport.authenticate('instagram'));

app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/' }),
  (req, res)=> {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

  //Profile Route
app.get('/profile',ensureAuthentication,(req, res) => {
  Post.find({user: req.user._id})
  .populate('user')
  .then((posts)=>{
      res.render('profile',{posts:posts});
  });
   
});

//Handle Route for all Users

app.get('/users',ensureAuthentication,(req,res)=>{
User.find({})
.then((users) =>{
res.render('users',{
    users:users
});
});
});

//Display one user profile
app.get('/user/:id',(req,res)=>{
User.findById({_id:req.params.id})
.then((user) =>{
    res.render('user',{user:user});
});
});

//Handle email route
app.post('/addEmail',(req,res)=>{
    const email =req.body.email;
    User.findById({_id:req.user._id})
    .then((user)=>{
        user.email =email;
        user.save()
        .then(()=>{
            res.redirect('/profile');
        });
    });
});

//Handle Phone post Route
app.post('/addPhone',(req,res) => {
const phone =req.body.phone;
User.findById({_id :req.user._id})
.then((user) => {
      user.phone =phone;    
      user.save()
.then(() =>{
    res.redirect('/profile');
});
});
});

//Handle Location post Route
app.post('/addLocation',(req,res) => {
    const location=req.body.location;
    User.findById({_id:req.user._id})
    .then((user) => {
        user.location=location;
        user.save()
        .then(()=>{
            res.redirect('/profile');
        });
    });
});


//Handle addpost Route
app.get('/addpost',(req,res)=>{
    res.render('addPost');
})

//Handle Post route
app.post('/savePost',(req,res)=>{
var allowComments;
if(req.body.allowComments){
            allowComments =true;
}else{
    allowComments = false;
}
const newPost={
    title:req.body.title,
    body:req.body.body,
    status:req.body.status,
    allowComments:allowComments,
    user:req.user._id,
}
new Post(newPost).save()
.then(()=>{
    res.redirect('/posts');
});
});

//Handle posts route

app.get('/posts',ensureAuthentication,(req,res)=>{
Post.find({status:'public'})
.populate('user')
.sort({date: 'desc'})
.then((posts)=>{
res.render('publicPosts',{
posts:posts
});
});
});
//Handle User Logout

app.get('/logout',(req,res)=>{
req.logout();
res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});