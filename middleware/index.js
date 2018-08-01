const Trail = require("../models/trail")
const Comment =require("../models/comment")


const middleWareObj = {}
middleWareObj.checkCampgroundOwnership = function(req,res,next){
    //check the user  by id if login
    if(req.isAuthenticated()){
        Trail.findById( req.params.id, function(error, trails){
            if(error){
                req.flash("warning", "sorry campground not found");
                res.redirect("back");
            }else{
                //check if the user own the campground
                if(trails.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("danger", "You don't have permission to do that")
                    res.redirect("back");
                }
            }
            
        });
    }else{
        req.flash("warning", "please login first");
        res.redirect("back");
    }

}
middleWareObj.checkCommentsOwnerShip = function(req,res,next){
    if(req.isAuthenticated()){
     Comment.findById(req.params.comment_id, function(error, foundComment){
         if(error){
             res.redirect("back")
         }else{
             //check if the user own the comments
             if(foundComment.author.id.equals(req.user._id)|| req.user.isAdmin){
                 next();
             }else{
                 res.redirect("back")
             }
         }
     })   
    }else{
        req.flash("warning", "please login first")
        res.redirect("back");
    }
}


//middleware check the if the user login or not
middleWareObj.islogin = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login')
}

module.exports = middleWareObj;