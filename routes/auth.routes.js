// routes/auth.routes.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var cookieParser = require('cookie-parser');

const router = express.Router();
const userSchema = require("../models/User");
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');
const NewsSchema = require("../models/News");
const BlogsSchema = require("../models/Blogs");




//========================================================================
//                              USER MODULE
//========================================================================


// Get Users
router.route('/').get((req, res) => {
    userSchema.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
});



// Register User
router.post("/register-user",
    [
        check('name')
            .not()
            .isEmpty()
            .isLength({ min: 3 })
            .withMessage('Name must be atleast 3 characters long'),
        check('email', 'Email is required')
            .not()
            .isEmpty(),
        check('password', 'Password should be between 5 to 8 characters long')
            .not()
            .isEmpty()
            .isLength({ min: 5, max: 8 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        console.log(req.body);

        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        }
        else {


        bcrypt.hash(req.body.password, 10, function(hash) {
            const user = new userSchema({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
          
                      });

                      user.save().then((response) => {
                        res.status(201).json({
                            message: "User successfully created!",
                            result: response 

                        });
                    }).catch(error => {
                        res.status(500).json({
                            error: error
                        });

                      /*
                      user.save(function(response) {

                        res.status(201).json({
                                  message: "User successfully created!",
                                  result: response
                              }).catch(function(error){
                       res.status(500).json({
                                  message:"Something went wrong!"
                }); */

         
            });
        });
    }
});
       



// Sign-in
router.post("/signin", (req, res, next) => {
    let getUser;
    userSchema.findOne({
        email: req.body.email
    }).then(user => {
        if (!user) {
            return res.status(401).json({
                message: "Authentication failed email"
            });
        }
        getUser = user;
        return (true);
        //return bcrypt.compare(req.body.password, user.password);
    }).then(response => {
        if (!response) {
            return res.status(401).json({
                message: "Authentication failed password"
            });
        }
        else {
        let jwtToken = jwt.sign({
            email: getUser.email,
            userId: getUser._id
        }, "longer-secret-is-better", {
            expiresIn: "1h"
        });

        // storing our JWT web token as a cookie in our browser
        res.cookie('token',jwtToken,{ maxAge: 2 * 60 * 60 * 1000, httpOnly: true });  // maxAge: 2 hours

        res.status(200).json({
            token: jwtToken,
            expiresIn: 3600,
            _id: getUser._id
        });       


        console.log("res.cookie");

        console.log(jwtToken);
    
    }
    }).catch(err => {
        console.log(err);
        return res.status(401).json({
            message: "Authentication failed compare"
                });
    });
   
});



// Get Single User
router.route('/user-profile/:id').get(authorize, (req, res, next) => {
    
    userSchema.findById(req.params.id, (error, data) => {

        
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
});

// Update User
router.route('/update-user/:id').put((req, res, next) => {

    //console.log(req.body.name);
    //console.log(req.body.email);
    //console.log(req.body.password);
    //console.log(req.params.id);

console.log([{name: req.body.name,email: req.body.email,password: req.body.password}]);

    userSchema.updateMany({'_id': { $in: req.params.id }}, {$set:{name: req.body.name,email: req.body.email,password: req.body.password}}, {multi: true})
    .then(result => {
        res.status(200).json({ message: "User updated successfully!" });
       })
       .catch(err => {
        console.log(err);
        res.status(400).json({ message: err.message });
       });

   });



// Delete User
router.route('/delete-user/:id').delete((req, res, next) => {
    userSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                message: "User successfully deleted!",
                msg: data
               
                
            })
        }
    })
});



// Verify Token  
function verifyToken(req, res,next) {  

    const bearerHearder = req.headers['authorization'];  

    if(typeof bearerHearder != 'undefined'){  

        const bearer = bearerHearder.split(' ');  

        const bearerToken = bearer[1];  

        req.token = bearerToken;  

        next();  
  
    }else{  
        // Forbidden  
        res.status(403);
        res.send({errorCode:"You are not allowed access to this page. Please, log in!'"});
    }  
}  


router.post('/validate',verifyToken,(req, res)=>{  
    jwt.verify(req.token,'longer-secret-is-better',(err,authData)=>{  
        if(err){  
           
        res.sendStatus(403);
       
        }else{  
            res.json({  
                message: 'Validated',  
                authData  
            });  
        }  
    });  
});  



//========================================================================
//                              NEWS MODULE
//========================================================================

// List News
router.route('/news').get(verifyToken,(req, res) => {
    jwt.verify(req.token,'longer-secret-is-better',(err,authData)=>{  
        if(err){  
            res.sendStatus(403);
        }else{  
            NewsSchema.find((error, response) => {
                if (error) {
                    return next(error)
                } else {
                    res.status(200).json(response)

            } } ); }} );});
    


// Create News
router.post('/news/create',verifyToken,(req, res)=>{  
    jwt.verify(req.token,'longer-secret-is-better',(err,authData)=>{  
        if(err){  
        res.sendStatus(403);
        }else{  
            const news = new NewsSchema({
                title: req.body.title,
                content: req.body.content,
                image: req.body.image
      
                  });

                  news.save().then((response) => {

                    res.status(201).json({
                        message: "News successfully added!",
                        result: response 

                    });
                })

        } }); } );


  
// Update News
router.route('/news/update/:id').put(verifyToken,(req, res, next) => {

    jwt.verify(req.token,'longer-secret-is-better',(err,authData)=>{  
        if(err){  
            res.sendStatus(403);
        }else{  
            
    //console.log([{title: req.body.title, content: req.body.content, image: req.body.image}]);

    NewsSchema.updateMany({'_id': { $in: req.params.id }}, {$set:{title: req.body.title, content: req.body.content, image: req.body.image}}, {multi: true})
    .then(result => {

        NewsSchema.findById(req.params.id)        
        .lean().exec(function (err, updatedresults) {
        if (err) return console.error(err)
        try {
            res.status(200).json({ message: "News post updated successfully!",
            msg: updatedresults });

            //console.log(updatedresults)            
        } catch (error) {
            console.log("Error getting updated results!")
            console.log(error)
        } 
    });

}).catch(err => {
        console.log(err);
        res.status(400).json({ message: err.message });
       });
        } } );} );


// Delete News
router.route('/news/delete/:id').delete(verifyToken,(req, res, next) => {

    jwt.verify(req.token,'longer-secret-is-better',(err,authData)=>{  
        if(err){  
            res.sendStatus(403);
        }else{  
            
    NewsSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                message: "News post successfully deleted!",
                msg: data
               
                
            })
        } 
    }); }});});
                 


//========================================================================
//                              BLOGS MODULE
//========================================================================

// List Blogs
router.route('/blogs').get(verifyToken,(req, res) => {
    jwt.verify(req.token,'longer-secret-is-better',(err,authData)=>{  
        if(err){  
            res.sendStatus(403);
        }else{  
            BlogsSchema.find((error, response) => {
                if (error) {
                    return next(error)
                } else {
                    res.status(200).json(response)

            } } ); }} );});


// Create Blogs
router.post('/blogs/create',verifyToken,(req, res)=>{  
    jwt.verify(req.token,'longer-secret-is-better',(err,authData)=>{  
        if(err){  
        res.sendStatus(403);
        }else{  
            const blogs = new BlogsSchema({
                title: req.body.title,
                content: req.body.content,
                image: req.body.image
      
                  });

                  blogs.save().then((response) => {

                    res.status(201).json({
                        message: "Blog post successfully added!",
                        result: response 
                    });
                })
        } }); } );


          
// Update Blogs
router.route('/blogs/update/:id').put(verifyToken,(req, res, next) => {

    jwt.verify(req.token,'longer-secret-is-better',(err,authData)=>{  
        if(err){  
            res.sendStatus(403);
        }else{  
            
    //console.log([{title: req.body.title, content: req.body.content, image: req.body.image}]);

    BlogsSchema.updateMany({'_id': { $in: req.params.id }}, {$set:{title: req.body.title, content: req.body.content, image: req.body.image}}, {multi: true})
    .then(result => {

        BlogsSchema.findById(req.params.id)        
        .lean().exec(function (err, updatedresults) {
        if (err) return console.error(err)
        try {
            res.status(200).json({ message: "Blog post updated successfully!",
            msg: updatedresults });

            //console.log(updatedresults)            
        } catch (error) {
            console.log("Error getting updated results!")
            console.log(error)
        } 
    });

}).catch(err => {
        console.log(err);
        res.status(400).json({ message: err.message });
       });
        } } );} );


// Delete Blogs
router.route('/blogs/delete/:id').delete(verifyToken,(req, res, next) => {

    jwt.verify(req.token,'longer-secret-is-better',(err,authData)=>{  
        if(err){  
            res.sendStatus(403);
        }else{  
            
        BlogsSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                message: "Blog post successfully deleted!",
                msg: data
               
                
            })
        } 
    }); }});});
                 

module.exports = router;