var express = require("express"),
  app = express(),
  flash = require("connect-flash"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  User = require("./models/user.js");

mongoose.connect("");
var port = process.env.PORT || 5000;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

// admin login & logout
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "Gowty did the app",
    resave: false,
    saveUninitialized: false
  })
);

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/home", function(req, res) {
  res.render("landing");
});

app.get("/", isLoggedIn, function(req, res) {
  res.render("dashboard", { user: req.user });
});

// Authentication
// create admin
app.post("/register", function(req, res) {
  User.register(
    new User({
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      gender: req.body.gender,
      mobile: req.body.mobile,
      address: req.body.address
    }),
    req.body.password,
    function(err, user) {
      if (err) {
        console.log(err);
        res.redirect("/");
      }
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "You are Registered and now can LogIn");
        res.redirect("/");
      });
    }
  );
});

// admin login & logout
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/home",
    successFlash: "successfully loggedin",
    failureFlash: "Incorrect Username or password"
  })
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/home");
  }
}

// edit account
app.put("/edit/:id", function(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body.edit, function(err, updated) {
    if (err) {
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  });
});

// delete account
app.delete("/del/:id", function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/home");
    } else {
      res.redirect("/home");
    }
  });
});

app.listen(port, function() {
  console.log("SERVER STARTED AT PORT 5000");
});
