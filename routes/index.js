const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Trail = require("../models/trail")
const passport= require("passport");


// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});


//register routes
router.post('/register', function(req,res){
    var newUser = new User({
        avatar: req.body.avatar,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        
    })
    if(req.body.admin === 'moe2535'){
        newUser.isAdmin = true;
    }
User.register(newUser, req.body.password, function(error, user){
    if(error){
         return res.render("register", {error: error.message});
    }
passport.authenticate("local")(req,res, function(){
      req.flash("success", "welcome to trail you successfuly created an accout");
        res.redirect("/trails");
       
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

router.post("/login", passport.authenticate("local",{
    successRedirect: "/trails",
    failureRedirect: "/login"
}), function(req,res){
     
});

//handle logout
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "you successfully logout");
    res.redirect("/trails")
});

//user profile route

router.get("/users/:id", function(req,res){
    User.findById(req.params.id, function(error, foundUser){
        if(error){
            req.flash("warning", "something went wrong")
            return res.redirect('back')
        }
         Trail.find().where('author.id').equals(foundUser._id).exec(function(error, trails) {
      if(error) {
        req.flash("warning", "Something went wrong.");
        return res.redirect("/trails");
      }
      res.render("users/show", {user: foundUser, trails: trails});
    })
  });
});

module.exports = router;