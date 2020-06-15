const passport = require("passport");
const bcrypt = require("bcrypt");
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
module.exports = function(app, db) {
  app.route("/").get((req, res) => {
    //Change the response to render the Pug template
    res.render(process.cwd() + "/views/pug/index", {
      title: "Home page",
      message: "login",
      showLogin: true,
      showRegistration: true
    });
  });

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + "/views/pug/profile", {
      username: req.user.username
    });
  });

  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.route("/register").post(
    (req, res, next) => {
      db.collection("users").findOne({ username: req.body.username }, function(
        err,
        user
      ) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect("/");
        } else {
          let hash = bcrypt.hashSync(req.body.password, 12);
          db.collection("users").insertOne(
            {
              username: req.body.username,
              password: hash
            },
            (err, doc) => {
              if (err) {
                res.redirect("/");
              } else {
                next(null, user);
              }
            }
          );
        }
      });
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => {
      res.redirect("/profile");
    }
  );

  app.route("/reset").get((req, res) => {
    db.collection("users").remove({});
  });
};
