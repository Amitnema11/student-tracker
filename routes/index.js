var express = require('express');
var router = express.Router();
const nodemailer= require("nodemailer")
const Post =require("../models/studentModel")

const User=require("../models/userModel")
const passport=require("passport")
const LocalStrategy =require("passport-local")

passport.use(new LocalStrategy(User.authenticate()))


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { admin: req.user});
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { admin: req.user});
});

router.get('/about', function(req, res, next) {
  res.render('about', { admin: req.user});
});

router.post('/signup',async function(req, res, next) {
  try{
    await User.register(
      {username: req.body.username, email: req.body.email},
      req.body.password
    )
    res.redirect("/signin")
  }
  catch(error){
    console.log(error)
    res.send(error)
  }
});

router.get('/profile',isLoggedIn, async function(req, res, next) {
  try{
    
    const user =await req.user.populate("posts")
    console.log(user.posts)
  res.render('profile' ,{ admin: req.user, posts: user.posts });
}
catch(err){
  res.send(err)
}
});

router.get('/delete/:id',isLoggedIn, async function(req, res, next) {
  try{
  await Post.findByIdAndDelete(req.params.id)
  res.redirect('/profile');
  }
  catch(err){
    res.send(err)
  }
});

router.get('/update/:id',isLoggedIn, async function(req, res, next) {
  try{
 const user= await Post.findById(req.params.id)
   res.render("update",{user, admin: req.user})
}
  catch(err){
    res.send(err)
  }
});

router.post('/update/:id',isLoggedIn,  async function(req, res, next) {
  try{
  await Post.findByIdAndUpdate(req.params.id,req.body)
   res.redirect("/profile")
}
  catch(err){
    res.send(err)
  }
});

router.get('/filter', async function(req, res, next) {
  try{
     let {posts} =await req.user.populate("posts")
posts=posts.filter((d)=>
   d[req.query.key] ===req.query.value)

  res.render('profile' , { admin: req.user, posts});
    }
    catch(err){
      res.send(err)
    }
});

router.get('/signin', function(req, res, next) {
  res.render('signin' , { admin: req.user});
});

router.post('/signin', 
passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/signin"
}),
function(req, res, next) {
 
});

function isLoggedIn(req,res,next){

  if(req.isAuthenticated()){
    next()
  }

  else{
    res.redirect("/signin")
  }
}


router.get('/signout',isLoggedIn, function(req, res, next) {
req.logout(()=>{
  res.redirect("/signin")
})
});



router.get('/login', function(req, res, next) {
  res.render('login' , { admin: req.user});
});

router.get('/forget', function(req, res, next) {
  res.render('forget' , { admin: req.user});
});

router.post('/send-mail',async function(req, res, next) {
try{
  const user= await User.findOne({email: req.body.email})
  if(!user) return res.send("user not found")



sendmailhandler(req,res,user,user.email)


}catch(error){
  res.send(error)
  console.log(error)
}
});

function sendmailhandler(req,res,user,email) {
  const otp = Math.floor(1000 + Math.random() * 9000);

// admin mail address, which is going to be the sender
const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
      user: "amitnema400@gmail.com",
      pass: "iwkv trqd ssvo nrac",
  },
});

// receiver mailing info
const mailOptions = {
  from: "Amit Pvt. Ltd.<amitnema400@gmail.com>",
  to: email,
  subject: "Testing Mail Service",
  // text: req.body.message,
  html: `<h1>${otp}</h1>`,
};

// actual object which intregrate all info and send mail
transport.sendMail(mailOptions, (err, info) => {
  if (err) return res.send(err);
  console.log(info);
  user.resetPasswordOtp =otp
   user.save()  
   res.render("otp", {admin: req.user,email: user.email})
});



}

router.post('/match-otp/:email',async function(req, res, next) {
try {
  const user= await User.findOne({email: req.params.email})

  if (user.resetPasswordOtp== req.body.otp) {

    user.resetPasswordOtp=-1
    await user.save()
      res.render("resetpassword",{admin: req.user, id: user._id})

  } else {
    res.send("INVALID OTP, try again     <a href='/forget'>Forget password</a>")
  }
  
} catch (error) {
  res.send(error)
}

});


router.post('/resetpassword/:id',async function(req, res, next) {
try {
  const user= await User.findById(req.params.id)

  await user.setPassword(req.body.password)
  await user.save()

  res.redirect("/signin")
} catch (error) {
  res.send(error)
}

});

router.get('/reset', isLoggedIn, function(req, res, next) {
  res.render('reset' , { admin: req.user});
});

router.post('/reset', isLoggedIn,async function(req, res, next) {
  try {
   await req.user.changePassword(
      req.body.oldpassword,
      req.body.newpassword
    )
   await req.user.save()
   res.redirect("/profile")
    
  } catch (error) {
    res.send(error)
  }
});


router.get('/add', isLoggedIn, function(req, res, next) {
  res.render('add' , { admin: req.user});
});

router.post('/add', isLoggedIn,async function(req, res, next) {
try {
  const post = await new Post(req.body)
 req.user.posts.push(post._id)
 post.user= req.user._id
//  res.json(post)

await post.save()
await req.user.save()
res.redirect("/profile")

} catch (error) {
  res.send(error)
}
});

module.exports = router;
