require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const flash     = require("connect-flash");
const methodOvrride = require("express-method-override");
const Trail = require("./models/trail");
const Comment = require("./models/comment");
const User = require("./models/user");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");




//requiring routes
const trailRoute =require("./routes/trail");
const commentRoute = require("./routes/comment");
const indexRouter = require("./routes/index");

//app configuration
const url = process.env.DATABASEURL || 'mongodb://localhost/allTrail';
mongoose.connect(url);
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname +"/public"));
app.use(flash());
app.use(methodOvrride("_method"));
app.locals.moment = require('moment');



//authentication configuration
app.use(session({
   secret: "some otunn doon eith lkkjjjdbL",
   resave: false,
   saveUninitialized: false 
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleWare to function if there is currentuser or not
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
   res.locals.danger = req.flash("danger");
   
    next();
});


app.use('/trails', trailRoute);
app.use('/trails/:id/comments', commentRoute);
app.use(indexRouter);



app.get('/', function(req,res){
   res.redirect('/trails') 
})




app.listen(process.env.PORT, process.env.IP, function(){
    console.log(" trail server started");
});


