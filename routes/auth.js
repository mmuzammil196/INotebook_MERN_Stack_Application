const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = 'helloinotebookUser'

// Route : 1 : Create a User : Using POST "/api/auth/createuser"  doesn't require authentication means no login required.
router.post('/createuser',[
   body('name').isLength({ min: 4 }),
   body('email').isEmail(),
   body('password').isLength({ min: 5 })
], async(req, res)=>{
   let success = false;
   // console.log(req.body);
   // const user = User(req.body);
   // user.save()

//  if there are errors, return bad request and errors
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({success, errors: result.array() });
  }
   
//   check whether user with this email is exists already
try {
   let user = await User.findOne({email: req.body.email});
   // console.log(user);
   if (user){
      return res.status(400).json({success, error: "Sorry user with this email is already exists"});
   }
      const salt =  await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email
      
   })
   // .then (user => res.json(user)).catch(err=> {console.log(err) , res.json({error: 'Please Enter a Unique Valie for Email Address', message: err.message}) });
   // res.send(req.body);
   const data = {
      user:{
         id : user.id
      } 
   }
   const authtoken = jwt.sign(data, JWT_SECRET);
   success = true;
   res.json({success, authtoken});
   // console.log(jwtData)
   // res.json(user);
} catch(error) {
   console.log(error.messgae);
   res.status(500).send("Internal Server Error Occured");
}
})

// Authenticate a User : Using POST "/api/auth/login" . no login required.
router.post('/login',[
   body('email', 'Enter a Valid Email').isEmail(),
   body('password', 'Password cannot be blank').exists()
], async(req, res)=>{
   // console.log(req.body);
   // const user = User(req.body);
   // user.save()
   let success = false;
//  if there are errors, return bad request and errors
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }

  const {email, password} = req.body;
  try {
   let user = await User.findOne({email});
   if (!user){
      // let success = false;
      return res.status(400).json({success, error: "Please try to login with correct credentials"})
   }

   const comparePassword = await bcrypt.compare(password, user.password);
   if (!password){
      // let success = false;
      return res.status(400).json({success, error: "Please try to login with correct credentials"})
   }

   const data = {
      user:{
         id : user.id
      } 
   }
   const authtoken = jwt.sign(data, JWT_SECRET);
   success = true;
   res.json({success, authtoken});

  } catch (error) {
   console.log(error.messgae);
   res.status(500).send("Internal Server Error Occured");
  }
})

// Route : 3  Get Login Use Detailr : Using POST "/api/auth/getuser" . login required.
router.post('/getuser', fetchuser, async(req, res)=>{
try {
   userId = req.user.id;
   const user = await User.findById(userId).select("-password");
   res.send(user);
} catch (error) {
   res.status(500).send("Internal Server Error Occured");
}
})



module.exports = router