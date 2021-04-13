var Joi = require('joi');
import { connection } from '../database/mysql.js';
import { SignupStatus, updateuserschema, userschema } from '../dataschema/user_schema.js';
const bcrypt = require('bcrypt');
const UserModel = require('../Models/UserModel');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
export async function createUser(req, res) {
    console.log("Inside create user post Request");

    const { error, value } = Joi.object().keys(
        { user: userschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }

    let user = value.user;
    console.log("User Creation ", JSON.stringify(user));
    let conn;
    try {
        conn = await connection();
        const storedUser = await getUserById(user.email);

        if (storedUser && isUserInvited(storedUser)) {
            user = await updateUser(user);
        } else {
            user = await insertUser(user);
        }

    } catch (err) {
        console.log("coming here", err);
        res.status(500)
            .send({
                code: err.code,
                msg: "Unable to create user. Please check application logs for more detail.",
            }
            ).end();
        return;
    } finally {
        conn && conn.release();
    }
    const payload = { _id: user._id, username: user.email };
    const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: 1008000
    });
    res.status(200).send({ user, token }).end();
    return;
    //res.status(200).cookie('cookie', user.email, { maxAge: 900000, httpOnly: false, path: '/' }).send(user).end();
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

    const user = value.user;
    let conn;
    try {
        conn = await connection();
        const storedUser = await getUserById(user.email);

        if (!storedUser) {
            res.status(500)
                .send({
                    code: 'INVALID_USER_ID',
                    msg: 'Invalid user ID.',
                }
                ).end();
            return;
        }

        console.log("current user  " + JSON.stringify(user));

        if (user.new_password) {
            const passwordMatch = await matchPassword(user.password, storedUser.password);
            if (!passwordMatch) {
                res.status(500)
                    .send({
                        code: 'INVALID_PASSWORD',
                        msg: 'Invalid password.',
                    }
                    ).end();
                return;
            }
            user.password = await hashPassword(user.new_password);
            delete user.new_password;
        } else {
            console.log("Stored pass" + storedUser.password);
            console.log("current pass" + user.password);
            if (storedUser.password !== user.password) {
                res.status(500)
                    .send({
                        code: 'INVALID_PASSWORD',
                        msg: 'Invalid password.',
                    }
                    ).end();
                return;
            }
        }
        console.log("Going inside update user ", user);
        await updateUser(user);
    } catch (err) {
        console.log(err);
        res.status(500)
            .send({
                code: err.code,
                msg: 'Unable to successfully insert the user! Please check the application logs for more details.',
            }
            ).end();
        return;
    } finally {
        conn && conn.release();
    }
    res.status(200).cookie('cookie', user.email, { maxAge: 900000, httpOnly: false, path: '/' }).send(user).end();
    return;
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
    const { id, password } = value;

    let conn;
    try {
        conn = await connection();
        const user = await getUserById(id);
        const passwordMatch = await matchPassword(password, user && user.password || '');
        if (!passwordMatch) {
            res.status(400)
                .send({
                    code: 'INVALID_PASSWORD',
                    msg: 'Invalid password.',
                }
                ).end();
            return;
        }
        if (user) {
            const payload = { _id: user._id, username: user.email };
            const token = jwt.sign(payload, process.env.SECRET, {
                expiresIn: 1008000
            });
            res.status(200).send({ user, token }).end();
            return;
        }
        res.status(400).send({ code: 'INVALID_LOGIN', msg: 'UserId and password does not exists.' }).end();
    } catch (err) {
        console.log(err);
        res.status(500).send({ code: err.code, msg: 'Unable to validate the credentials.' }).end();
        return;
    } finally {
        conn && conn.release();
    }
}


async function insertUser(user) {
    console.log("Inside insert User");
    user.password = await hashPassword(user.password);
    var user = new UserModel(user);
    return await user.save();
}

async function updateUser(user) {
    console.log("Inside update user");
    const value = await UserModel.findOneAndUpdate(
        { email: user.email },
        { ...user },
        { new: true }
    );
    await value.save();
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
    let searchString = req.query.queryString;
    console.log("Search String " + searchString);
    let limit = req.query.limit;
    let conn = null;
    try {
        conn = await connection();
        const users = await searchUsers(searchString, limit);
        res.status(200).send(users).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully get the search result! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
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