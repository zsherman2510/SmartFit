const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");

const Client = mongoose.model("client");
const keys = require("../config/keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      console.log(jwt_payload);
      Client.findById(jwt_payload.id)
        .then(client => {
          if (client) {
            return done(null, client);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
