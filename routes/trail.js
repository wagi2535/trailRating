const express = require("express");
const router = express.Router();
const Trail = require("../models/trail");
const middleWareObj= require("../middleware/index")
const multer = require("multer");
const cloudinary = require('cloudinary');
const NodeGeocoder = require('node-geocoder');

///confiuring google map
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
var geocoder = NodeGeocoder(options);
var geocoder = NodeGeocoder(options);

//confiquring multer
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})

//configuring cloudinary
cloudinary.config({ 
  cloud_name: 'dqefjuy9x', 
  api_key: 692636894294679, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});



//fuzzy search reqex
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


//INDEX - show all campgrounds
router.get("/", function(req, res){
    //sett up the query search
    if(req.query.search){
         const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Trail.find({'name': regex}, function(err, trails){
       if(err){
           console.log(err);
       } else {
          res.render("trails/index",{trails: trails});
       }
    });
        
    } else{
         Trail.find({}, function(err, trails){
       if(err){
           console.log(err);
       } else {
          res.render("trails/index",{trails: trails, pages:'trails'});
       }
    });
        
    }
});

//new route
router.get('/new', middleWareObj.islogin,function(req,res){
    res.render('trails/new');
});

//create Route
router.post("/",upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('warning', err.message);
        return res.redirect('back');
      }
     geocoder.geocode(req.body.trail.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('/trails');
    }
    req.body.trail.lat = data[0].latitude;
    req.body.trail.lng = data[0].longitude;
    req.body.trail.location = data[0].formattedAddress;
 
      // add cloudinary url for the image to the campground object under image property
      req.body.trail.image = result.secure_url;
      // add image's public_id to campground object
      req.body.trail.imageId = result.public_id;
      // add author to campground
      req.body.trail.author = {
        id: req.user._id,
        username: req.user.username
      }
     
      Trail.create(req.body.trail,function(err, trails) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/trails/' + trails.id);
      });
    })
})
});

//show route 
router.get('/:id', function(req,res){
    Trail.findById(req.params.id).populate('comments').exec(function(error, foundById){
        if(error){
            console.log(error)
        }else{
            res.render('trails/show', {trails:foundById});
        }
    })
})


//edit route
router.get('/:id/edit',middleWareObj.checkCampgroundOwnership, function(req,res){
    Trail.findById(req.params.id,  function(error, trails){
        if(error){
           req.flash('warning', 'trying something went wrong')
            res.redirect('/trails')
            
        }else{
           
         res.render("trails/edit", {trails:trails})
        }
    });
});

//update route
router.put("/:id", middleWareObj.checkCampgroundOwnership,upload.single('image'), function(req, res){
    Trail.findById(req.params.id,function(err, trail){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if(req.file){
          cloudinary.v2.uploader.destroy(trail.imageId, function(err){ 
              if(err){
                 req.flash("warning", "something went wrong");
                 return res.redirect("trails"); 
              }
                cloudinary.v2.uploader.upload(req.file.path, function(error, result){
                  if(error){
                      req.flash("warning", "something went wrong");    
                      return res.redirect("trails")
                    }
                   
                     // add cloudinary url for the image to the trail object under image property
                        req.body.trail.image = result.secure_url;
                    // add image's public_id to trail object
                        req.body.trail.imageId = result.public_id;
                 })
            })
            }
          geocoder.geocode(req.body.trail.location, function (err, data) {
                        if (err || !data.length) {
                        req.flash('error', 'Invalid address');
                        return res.redirect('/trails');
                        }
                        req.body.trail.lat = data[0].latitude;
                        req.body.trail.lng = data[0].longitude;
                        req.body.trail.location = data[0].formattedAddress; 
         Trail.findByIdAndUpdate(req.params.id, req.body.trail, function(err, trail){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            
            req.flash("success","Successfully Updated!");
             res.redirect('/trails/' + trail.id);
        }
    });  
          })
        }
       
    });
});


//delete route
router.delete('/:id', function(req,res){
    Trail.findByIdAndRemove(req.params.id, function(error){
        if(error){
            res.redirect('/trails')
        }else{
            req.flash('danger', "you deleted trail")
            res.redirect('/trails')
        
        }
    })   
        
    })

module.exports =router 