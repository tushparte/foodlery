const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
// Load User model
const User = require('./models/User');
const Restaurant = require('./models/restaurant')
const Review = require('./models/review');
const Dish = require('./models/dish');
const Order = require('./models/order');
const { ensureAuthenticated, forwardAuthenticated, restAuthenticate} = require('./config/auth');


const app = express();

// Passport Config
require('./config/passport')(passport);
//require('./config/restaurantpassport')(passport);

// Connect to MongoDB
mongoose
  .connect(
    "mongodb://localhost/foodlery",
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
// Welcome Page
app.get('/', (req, res) => res.render('home', {currentUser: req.user}));

app.get('/myprofile', (req, res) => {
  res.render('myprofile', {currentUser: req.user});
});

app.get('/myprofile/cart', (req, res) => {
  User.findById(req.user._id).populate('cart').exec((err, result) => {
    if(err) {
      console.log(err);
    } else {
      res.render('cart', {user: result, currentUser: req.user});
    }
  });
});

app.get('/myprofile/cart/checkout', (req, res) => {
  User.findById(req.user._id).populate('cart').exec((err, result) => {
    if(err) {
      console.log(err);
    } else {
      res.render('checkout', {user: result, currentUser: req.user});
    }
  });
});

app.post('/myprofile/cart/checkout', (req, res) => {
  let user = req.user;
  Order.create(req.body.order, (err, order) => {
    if(err) {
      res.redirect('/myprofile/cart');
    } else {
      order.placedby = user;
      order.dishes = user.cart;
      Dish.findById(order.dishes[0], (err, dish) => {
        if(err) {
          console.log(err);
          res.redirect('/myprofile/cart');
        } else {
          order.orderedfrom.id = dish.from.id;
          //working fine till here
          user.orders.push(order);
          user.cart = [];
          order.save();
          user.save();
          Restaurant.findById(order.orderedfrom.id, (err, restaurant) => {
            if(err) {
              console.log(err);
              res.redirect('/cart');
            } else {
              restaurant.orders.push(order);
              restaurant.save();
              res.redirect('/myprofile');
            }
          });
        }
      });
    }
  });
});

app.get('/secret', ensureAuthenticated, (req, res) => {
  res.render('secret', {currentUser: req.user});
});

app.get('/register', forwardAuthenticated, (req, res) => {
  res.render('register', {currentUser: req.user});
});

app.post('/register', (req, res) => {
  const { name, email, password, password2, contact, city } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      currentUser: req.user
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          contact,
          city
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          contact,
          city
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                console.log(newUser);
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

app.get('/login', (req, res) => {
  res.render('login', {currentUser: req.user});
});

// Login
app.post('/login', (req, res, next) => {
  passport.authenticate('user-local', {
    successRedirect: '/myprofile',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

//Restaurant Routes

app.get('/registerrestaurant', (req, res) => {
  res.render('registerrestaurant', {currentUser: req.user});
});

app.post('/registerrestaurant', (req, res) => {
  const { name, email, password, password2, contact, city} = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    console.log(errors);
    res.render('registerrestaurant', {
      errors,
      name,
      email,
      password,
      password2,
      contact,
      city,
      currentUser: req.user
    });
  } else {
    Restaurant.findOne({ email: email }).then(restaurant => {
      if (restaurant) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          contact,
          city
        });
      } else {
        const newRestaurant = new Restaurant({
          name,
          email,
          password,
          contact,
          city
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newRestaurant.password, salt, (err, hash) => {
            if (err) throw err;
            newRestaurant.password = hash;
            newRestaurant
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                console.log(newRestaurant);
                res.redirect('/loginrestaurant');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

app.get('/loginrestaurant', (req, res) => {
  res.render('loginrestaurant', {currentUser: req.user});
});

app.post('/loginrestaurant', (req, res, next) => {
  passport.authenticate('restaurant-local', {
    successRedirect: '/myrestaurant',
    failureRedirect: '/loginrestaurant',
    failureFlash: true
  })(req, res, next);
});

app.get('/restaurant', (req, res) => {
  res.render('restaurant', {currentUser: req.user});
});

app.get('/restaurants', (req, res) => {
  Restaurant.find({}, (err, allRestaurants) => {
    if(err) {
      console.log(err);
    } else {
      res.render('restaurants/index', {
        allRestaurants: allRestaurants,
        currentUser: req.user
      });
    }
  });
});

app.get('/restaurants/:id', (req, res) => {
  Restaurant.findById(req.params.id).populate('reviews').exec((err, result) => {
    if(err) {
      console.log(err);
    } else {
      res.render('restaurants/show', {restaurant: result, currentUser: req.user});
    }
  });
});

app.post('/restaurants/:id/reviews', ensureAuthenticated, (req, res) => {
  Restaurant.findById(req.params.id, (err, restaurant) => {
    if(err){
      console.log(err);
      res.redirect('/restaurants');
    } else {
      Review.create(req.body.review, (err, review) => {
        if(err) {
          console.log(err);
        } else {
          review.author.id = req.user._id;
          review.author.name = req.user.name;
          review.save();
          restaurant.reviews.push(review);
          restaurant.save();
          res.redirect('/restaurants/' + restaurant._id);
        }
      });
    }
  });
});

app.get('/restaurants/:id/menu', (req, res) => {
  Restaurant.findById(req.params.id).populate('menu').exec((err, result) => {
    if(err) {
      console.log(err);
    } else {
      res.render('restaurants/menu', {restaurant: result, currentUser: req.user});
    }
  });
});

//add more dishes
app.post('/restaurants/:id/menu/add', ensureAuthenticated, (req, res) => {
  let restaurant = req.user;
  Dish.create(req.body.dish, (err, dish) => {
    if(err) {
      console.log(err);
    } else {
      dish.from.id = restaurant._id;
      dish.save();
      restaurant.menu.push(dish);
      restaurant.save();
      res.redirect('/myrestaurant');
    }
  });
});

app.post('/restaurants/:id/menu/addtocart', ensureAuthenticated, (req, res) => {
  let user = req.user;
  Dish.findById(req.body.dish, (err, dish) => {
    if(err) {
      console.log(err);
      res.redirect('/');
    } else {
      user.cart.push(dish);
      user.save();
      res.redirect('/myprofile/cart');
    }
  })
});

app.get('/myrestaurant', restAuthenticate, (req, res) => {
  res.render('restaurants/me', {currentUser: req.user});
});

app.get('/editprofile', restAuthenticate, (req, res) => {
  Restaurant.findById(req.user._id).populate('menu').exec((err, result) => {
    if(err) {
      console.log(err);
    } else {
      res.render('restaurants/editform', {restaurant: result, currentUser: req.user});
    }
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
