var Joi = require('joi');
import { updateuserschema, userschema } from '../dataschema/user_schema.js';
import { kafka_default_response_handler, kafka_response_handler } from '../kafka/handler';
const jwt = require('jsonwebtoken');
const kafka = require("../kafka/client");

export async function createUser(req, res) {
    console.log("Inside create user post Request");
    const { error } = Joi.object().keys(
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
    const { error } = Joi.object().keys(
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

export async function getUsersBySearchString(req, res) {
    kafka.make_request(
        "user-topic",
        { path: "user-search", queryString: req.query.queryString },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}
