var Joi = require('joi');
import { connection } from '../database/mysql.js';
import { SignupStatus, updateuserschema, userschema } from '../dataschema/user_schema.js';
const bcrypt = require('bcrypt');
const UserModel = require('../Models/UserModel');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const kafka = require("../kafka/client");
import { kafka_default_response_handler, kafka_response_handler } from '../kafka/handler';

export async function createUser(req, res) {
    console.log("Inside create user post Request");
    const { error, value } = Joi.object().keys(
        { user: userschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }
    kafka.make_request(
        "user-topic",
        { path: "user_signup", body: req.body },
        (err, results) => kafka_response_handler(res, err, results,
            (result) => {
                const user = result.data;
                const payload = { _id: user._id, username: user.email };
                const token = jwt.sign(payload, process.env.SECRET, {
                    expiresIn: 1008000
                });
                return res.status(result.status).send({ user, token });
            })
    );
}

export async function updateExistingUser(req, res) {
    console.log("Inside update user post Request", JSON.stringify(req.body));
    const { error, value } = Joi.object().keys(
        { user: updateuserschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }
    kafka.make_request(
        "user-topic",
        { path: "user-update", body: req.body },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function validateLogin(req, res) {
    console.log("Inside Login Post Request");
    const { error, value } = Joi.object().keys(
        {
            id: Joi.string().required(),
            password: Joi.string().required(),
        }
    ).validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }
    console.log("validateLogin: " + JSON.stringify(value));
    kafka.make_request(
        "user-topic",
        { path: "user-login", body: req.body },
        (err, results) => kafka_response_handler(res, err, results,
            (result) => {
                console.log('login response', result)
                const user = result.data;
                console.log('user ', user);
                const payload = { _id: user._id, username: user.email };
                const token = jwt.sign(payload, process.env.SECRET, {
                    expiresIn: 1008000
                });
                return res.status(result.status).send({ user, token });
            })
    );
}


async function insertUser(user) {
    console.log("Inside insert User");
    user.password = await hashPassword(user.password);
    var user = new UserModel(user);
    return await user.save();
}

export async function insertIfNotExist(user) {
    console.log("User id " + JSON.stringify(user));
    const id = user.email;
    const storedUser = await getUserById(id);
    if (storedUser) {
        return;
    }
    await insertUser(user);
}

export async function getUserById(userId) {
    console.log("Inside get user by Id");
    const user = await UserModel.findOne({ email: userId });
    console.log("user response  ", JSON.stringify(user));
    return user;
}

function isUserInvited(user) {
    console.log("isUserInvited: " + JSON.parse(user).registration_status);
    return (JSON.parse(user).registration_status === SignupStatus.INVITED);
}

export async function getUsersBySearchString(req, res) {
    kafka.make_request(
        "user-topic",
        { path: "user-search", queryString: req.query.queryString },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

async function searchUsers(searchString = "", limit = 20) {
    console.log("string " + searchString);
    const query = { $text: { $search: searchString } };
    const result = await UserModel.find(query).limit(Number(limit));
    console.log(result);
    if (result.length > 0) {
        return result;
    }
    return [];
}

async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) reject(err)
            resolve(hash)
        });
    })
    return hashedPassword;
}

export async function matchPassword(newPassword, storedEncryptedPassword) { // updated
    console.log("Inside match password");
    console.log("passw1" + newPassword + " password2 " + storedEncryptedPassword);
    const isSame = await bcrypt.compare(newPassword, storedEncryptedPassword) // updated
    console.log(isSame) // updated
    return isSame;

}