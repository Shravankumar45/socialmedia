// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// module.exports = app;
//Load Modules
const express =require('express');
const path=require('path');
const expressLayouts=require('express-ejs-layouts');
const mongoose =require('mongoose');
//Connect to Mongo uri exported from external file
const keys= require('./config/keys');


//
const app=express();


//Engine Setup.........
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine','ejs');

//setting up public folder
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));

//Connect to remote database

mongoose.connect(keys.MongoURI,{useNewUrlParser: true, useUnifiedTopology: true})
.then(function(){
console.log("connected to remote database");
}).catch((err)=>{
console.log(err);
});

//Set environment Variable
const port = process.env.PORT || 3000;



app.get('/',(req,res)=>{
res.render('main');
});
app.get('/about',(req,res)=>{
res.render('about');
});

app.listen(port,()=>{
    console.log(`Server is running by Nodemon on port ${port}`);
});