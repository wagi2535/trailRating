const express = require("express");
const router = express.Router({mergeParams:true});
const Trail = require("../models/trail");
const Comment = require("../models/comment");
const middlewareObj = require("../middleware/index")


//new comments router
router.get('/new', middlewareObj.islogin, function(req,res){
    Trail.findById(req.params.id, function(error, trails){
        if(error){
            console.log(error);
        }else {
          res.render('comments/new', {trails: trails}); 
        }
    });
});

//create comment route
router.post('/', function(req,res){
    Trail.findById(req.params.id, function(error, trails){
        if(error){
            console.log(error)
        }else{
            Comment.create(req.body.comment, function(error, comment){
                if(error){
                    console.log(error)
                }else{
        //add username and id to the comment
         comment.author.id = req.user._id;
         comment.author.username = req.user.username;
         comment.save()
                    
         ///associate comment with trail
         trails.comments.push(comment)
         trails.save()
         console.log(comment)
         res.redirect('/trails/' +trails._id)
                }
            })
        }
    })
   
})

//edit neasted comments route
router.get('/:comment_id/edit', function(req,res ){
 Comment.findById(req.params.comment_id, function(error, foundComment){
     if(error){
         console.log(error)
         res.redirect('back')
     }else{
        res.render('comments/edit', {trail_id: req.params.id, comment:foundComment}) 
     }
 })
})

//updated neasted comments routes
router.put('/:comment_id', function(req,res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(error,updatedComment){
       if(error){
           console.log(error)
           res.redirect('back')
       }else{
           res.redirect("/trails/" + req.params.id)
       }
   }) 
})


//comment delete route
router.delete("/:comment_id", function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(error){
        if(error){
            res.redirect('back')
        }else{
            res.redirect('/trails/'+ req.params.id)
        }
    })
})

module.exports = router;