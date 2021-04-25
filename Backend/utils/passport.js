"use strict";
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const dotenv = require('dotenv');
const kafka = require("../kafka/client");
dotenv.config();

function auth() {
    var opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET
    };
    passport.use(
        new JwtStrategy(opts, (jwt_payload, callback) => {
            console.log('jwt_payload ', JSON.stringify(jwt_payload));
            const user_id = JSON.parse(JSON.stringify(jwt_payload)).username;
            console.log('user ID', user_id);
             //callback(null, true);
             //return;
            kafka.make_request(
                "auth-topic",
                { path: "user-auth", body: user_id },
                function (err, results) {
                    console.log('err ', err);
                    console.log('result ', results);
                    if (err) {
                        console.log(err);
                        return callback(err.data, false);
                    } else {
                        console.log("********* passport auth!!! ******");
                        return callback(null, true);
                    }
                }
            );
        })
    )
}

//exports.checkAuth = (req, res, next) => { next() };
 exports.auth = auth;
 exports.checkAuth = passport.authenticate("jwt", { session: false });


