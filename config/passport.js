const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');
const Restaurant = require('../models/restaurant');
const Valet = require('../models/valet');

module.exports = function(passport) {
  passport.use("user-local",
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.use('restaurant-local',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      Restaurant.findOne({
        email: email
      }).then(restaurant => {
        if (!restaurant) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, restaurant.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, restaurant);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.use('valet-local',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      Valet.findOne({
        email: email
      }).then(valet => {
        if (!valet) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, valet.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, valet);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );
  //need to generalize below for both strategies(User model and Resteraunt model)

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      if(!user){
        Restaurant.findById(id, function(err, user) {
          if(!user){
            Valet.findById(id, function(err, user){
              done(err, user);
            });
          } else {
            done(err,user);
          }
        });
      }else{
        done(err, user);
      }
    });
  });
};
