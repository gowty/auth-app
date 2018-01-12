var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  cookieParser = require("cookie-parser"),
  flash = require("connect-flash"),
  expressValidator = require("express-validator"),
  methodoverride = require("method-override"),
  mongoose = require("mongoose"),
  blog = require("./models/blog"),
  User = require("./models/user"),
  shortid = require("shortid"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/nt_blogs");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodoverride("_method"));
var port = process.env.PORT || 5000;

app.use(express.static("public"));

//USE PACKAGES
app.use(
  require("express-session")({
    secret: "Secret!!! Yarkittayum Solla Koodathuu",
    resave: false,
    saveUninitialized: false
  })
);

// IMAGE UPLOAD WITH MULTER
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
    req.flash("error", "Only image files are allowed!");
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "stark145",
  api_key: 575441377241541,
  api_secret: "boqBWmNfOLxidlhAsgnh39EbSiw"
});
// ------------------------------

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//EXPRESS VALIDATOR
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

//USE FLASH

app.use(flash());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", isLoggedIn, function(req, res) {
  res.render("index", { user: req.user });
});

app.get("/dashboard", isLoggedIn, function(req, res) {
  res.render("dashboard", { user: req.user });
});

// ========================================
//              BLOG SECTION
// =========================================

// RENDER ADD POST PAGE
app.get("/add-new-post", isLoggedIn, function(req, res) {
  User.find({}, function(err, allusers) {
    if (err) {
      console.log("Oops... something went wrong");
      console.log(err);
    } else {
      res.render("add-post", { author: allusers, user: req.user });
    }
  });
});

// ADD NEW POST
app.post("/add-post", upload.single("image"), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    // POST ID GENERATOR
    let postid = Math.floor(Math.random() * 10000);
    const post_id = postid.toString();

    // GET DATE
    var date = new Date().toDateString();

    //TIME ONLY

    var dateTime = new Date();
    var hrs = dateTime.getHours();
    var min = dateTime.getMinutes();
    var sec = dateTime.getSeconds();

    var mid = "AM";
    if (hrs == 0) {
      //At 00 hours we need to show 12 am
      hrs = 12;
    } else if (hrs > 12) {
      hrs = hrs % 12;
      mid = "PM";
    }
    var time = hrs + ":" + min + ":" + sec + "" + mid;

    //TIME STAMP
    var timeStamp = Math.floor(Date.now() / 1000);

    // GETTING CHECKBOX VALUE
    function getCheckboxvalue() {
      var value = [];
      for (
        var i = 0;
        i < document.getElementsByName("categories").length;
        i++
      ) {
        if (document.getElementsByName("categories")[i].checked) {
          value.push(document.getElementsByName("categories")[i].value);
        }
      }
      var categories = value.toString();
    }

    var author = req.body.author;
    var title = req.body.title;
    var status = req.body.status;
    var tags = req.body.tags;
    var image = (req.body.image = result.secure_url);
    var categories = req.body.categories;
    var content = req.body.content;

    var newpost = {
      post_id: post_id,
      author: author,
      title: title,
      status: status,
      tags: tags,
      categories: categories,
      date: date,
      time: time,
      timeStamp: timeStamp,
      image: image,
      content: content
    };

    blog.create(newpost, function(err, newlycreated) {
      if (err) {
        console.log("Oops... something went wrong");
        console.log(err);
      } else {
        console.log("Newly created ");
        req.flash("success", "Successfully Posted");
        res.redirect("/posts");
      }
    });
  });
});

// SHOW ALL POSTS
app.get("/posts", isLoggedIn, function(req, res) {
  blog.find({}, function(err, allposts) {
    if (err) {
      console.log("Oops... something went wrong");
      console.log(err);
    } else {
      res.render("all-posts", { post: allposts, user: req.user });
    }
  });
});

// SHOW POST BY ID
app.get("/posts/:id", isLoggedIn, function(req, res) {
  blog.findById(req.params.id, function(err, read_more) {
    if (err) {
      console.log(err);
    } else {
      res.render("post", { posts: read_more, user: req.user });
    }
  });
});

// Edit blog

//
// app.get("/bloglist", function(req, res) {
//   blog.find({}, function(err, allblog) {
//     if (err) {
//       console.log("Oops... something went wrong");
//       console.log(err);
//     } else {
//       res.render("bloglist", { blog: allblog });
//     }
//   });
// });
//
// app.get("/editblog/:id", function(req, res) {
//   blog.findById(req.params.id, function(err,blog) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.render("editblog", { blog:blog});
//     }
//   });
// });
//
// app.put("/editblog/:id",function(req,res){
//     blog.findByIdAndUpdate(req.params.id,req.body.edit,function(err,updated){
//         if(err){
//             res.redirect("/bloglist");
//         }  else {
//             res.redirect("/bloglist");
//         }
//     });
//
// });

// ========================================

// ========================================
//              USER SECTION
// ========================================

// RENDER SIGNUP PAGE
app.get("/add-new-user8345", isAdmin, function(req, res) {
  res.render("add-user", { user: req.user });
});

// USER REGISTER
app.post("/register", function(req, res) {
  // let users_no = Math.floor(Math.random() * 10000);
  // const users_id = users_no.toString()

  //TIME STAMP
  var timeStamp = Math.floor(Date.now() / 1000);
  const users_id = timeStamp.toString().substr(4, 10);

  var role = req.body.role;
  var username = req.body.username;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;

  // EXPRESS VALIDATION
  req.checkBody("email", "Invalid Email Address").isEmail();
  req
    .checkBody("password2", "Password does not match")
    .equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    console.log(errors[0].msg);
    req.flash("error", "Username Already Exist");
    res.redirect("/add-new-user8345", {
      error: errors[0].msg
    });
  } else {
    User.register(
      new User({
        users_id: users_id,
        role: role,
        username: username,
        firstname: firstname,
        lastname: lastname,
        email: email,
        timeStamp: timeStamp
      }),
      req.body.password,
      function(err, user) {
        passport.authenticate("local")(req, res, function() {
          console.log(user);
          req.flash("success", "You Are Registered And Now Can LogIn");
          res.redirect("/");
        });
      }
    );
  }
});

// REMEMBER ME COOKIE SAVE
app.use(function(req, res, next) {
  if (req.method == "POST" && req.url == "/login") {
    if (req.body.remember_me) {
      req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
      req.session.cookie.expires = false;
    }
  }
  next();
});

// RENDER CURRENT USER PROFILE PAGE
app.get("/profile", isLoggedIn, function(req, res) {
  res.render("profile", { user: req.user });
});

// CURRENT USER PROFILE UPDATE
app.put("/current-user/:id", function(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body.edit, function(err, updated) {
    if (err) {
      req.flash("error", "Oops something went wrong");
      res.redirect("/profile");
    } else {
      req.flash("success", "Updated Successfully");
      res.redirect("/profile");
    }
  });
});

// PASS ALL USERS DETAILS
app.get("/all-users", isLoggedIn, function(req, res) {
  User.find({}, function(err, allusers) {
    if (err) {
      console.log("Oops... something went wrong");
      console.log(err);
    } else {
      res.render("all-users", { users: allusers, user: req.user });
    }
  });
});

// PASS USERS DETAILS BY ID
app.get("/all-users/:id", isAdmin, isLoggedIn, function(req, res) {
  User.findById(req.params.id, function(err, user_profie) {
    if (err) {
      console.log(err);
    } else {
      res.render("user-profile", { uprofile: user_profie, user: req.user });
    }
  });
});

// OTHER USER PROFILE UPDATE
app.put("/all-users/:id", function(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body.edit, function(err, updated) {
    if (err) {
      req.flash("error", "Oops something went wrong");
      res.redirect("/all-users");
    } else {
      req.flash("success", "Updated Successfully");
      res.redirect("/all-users");
    }
  });
});

// OTHER USER PROFILE DELETE
app.delete("/all-users/:id", function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/all-users");
    } else {
      req.flash("error", "Account Deleted");
      res.redirect("/all-users");
    }
  });
});

// RENDER LOGIN PAGE
app.get("/user-signin", function(req, res) {
  res.render("user-signin");
});

// USER LOGIN
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user-signin",
    failureFlash: "Incorrect Username or Password!",
    successFlash: "Successfully LoggedIn "
  }),
  function(req, res) {
    res.render("/");
  }
);

// LOGOUT FUNCTION
app.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "You are now LoggedOut");
  res.redirect("/user-signin");
});

// RENDER CHANGE PASSWORD PAGE
app.get("/change-password", function(req, res) {
  res.render("change-password", { user: req.user });
  // console.log(date);
  console.log(newDate);
});

// ISLOGGEDIN FUNCTION
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You must signedin first");
    res.redirect("/user-signin");
  }
}

// ISADMIN FUNCTION
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "Admin") {
    next();
  } else {
    req.flash("error", "You are not an admin");
    res.redirect("/");
  }
}
// ========================================

// PORT
app.listen(port, function() {
  console.log("SERVER STARTED AT PORT 5000");
});
