const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const dotenv = require('dotenv');

export async function createUser(message, callback) {
    let response = {};
    let err = {};
    console.log("Inside create user post Request");

    let user = message.body.user;
    console.log("User Creation ", JSON.stringify(user));
    try {
        const storedUser = await getUserById(user.email);

        if (storedUser && isUserInvited(storedUser)) {
            user = await updateUser(user);
        } else {
            user = await insertUser(user);
        }

    } catch (error) {
        console.log("coming here", err);
        err.status = 500;
        err.data = {
            code: error.code,
            msg: "Unable to create user. Please check application logs for more detail.",
        };
        return callback(err, null);
    }

    response.status = 200;
    response.data = user;
    return callback(null, response);
}

export async function updateExistingUser(message, callback) {
    let response = {};
    let err = {};
    const user = message.body.user;
    console.log("Inside updateExisting User", user);
    try {
        const storedUser = await getUserById(user.email);

        if (!storedUser) {
            err.status = 500;
            err.data = {
                code: 'INVALID_USER_ID',
                msg: 'Invalid user ID.',
            };
            return callback(err, null);
        }

        console.log("current user  " + JSON.stringify(user));

        if (user.new_password) {
            const passwordMatch = await matchPassword(user.password, storedUser.password);
            if (!passwordMatch) {
                err.status = 500;
                err.data = {
                    code: 'INVALID_USER_ID',
                    msg: 'Invalid user ID.',
                };
                return callback(err, null);
            }
            user.password = await hashPassword(user.new_password);
            delete user.new_password;
        } else {
            console.log("Stored pass" + storedUser.password);
            console.log("current pass" + user.password);
            if (storedUser.password !== user.password) {
                err.status = 500;
                err.data = {
                    code: 'INVALID_USER_ID',
                    msg: 'Invalid user ID.',
                };
                return callback(err, null);
            }
        }
        console.log("Going inside update user ", user);
        await updateUser(user);
    } catch (error) {
        console.log(err);
        err.status = 500;
        err.data = {
            code: err.code,
            msg: 'Unable to successfully insert the user! Please check the application logs for more details.',
        };
        return callback(err, null);
    }
    response.status = 200;
    response.data = user;
    console.log("response ", user);
    return callback(null, response);
}

export async function validateLogin(message, callback) {
    console.log("Inside Login Post Request");
    let response = {};
    let err = {};
    const { id, password } = message.body;
    console.log("id", id, "pass ", password);
    try {
        const user = await getUserById(id);
        const passwordMatch = await matchPassword(password, user && user.password || '');
        if (!passwordMatch) {
            console.log("here 1");
            err.status = 500;
            err.data = {
                code: 'INVALID_USER_ID',
                msg: 'Invalid user ID.',
            };
            return callback(err, null);
        }
        if (user) {
            console.log("response user", user);
            response.status = 200;
            response.data = user;
            return callback(null, response);
        }
        err.code = 400;
        err.data = { code: 'INVALID_LOGIN', msg: 'UserId and password does not exists.' };
        console.log("here 2");
        return callback(err, null);
    } catch (error) {
        console.log(error);
        err.code = 500;
        err.data = { code: error.code, msg: 'Unable to validate the credentials.' };
        console.log("here 3");
        return callback(err, null);
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

export async function getUserByEmailId(message, callback) {
    let response = {};
    let error = {};
    console.log("Inside get user by Email ID");
    try {
        const user = await UserModel.findOne({ email: message });
        console.log("user response  ", JSON.stringify(user));
        response.status = 200;
        response.data = user;
        return callback(null, response);
    }
    catch (err) {
        console.log(err);
        error.code = 500;
        error.data = { code: err.code, msg: 'Unable to get the user by Email Id.' };
        return callback(error, null);
    }
}

export async function getUserById(userId) {
    console.log("Inside get user by Id", userId);
    const user = await UserModel.findOne({ email: userId });
    console.log("user response  ", JSON.stringify(user));
    return user;
}

function isUserInvited(user) {
    console.log("isUserInvited: " + JSON.parse(user).registration_status);
    return (JSON.parse(user).registration_status === SignupStatus.INVITED);
}

export async function getUsersBySearchString(message, callback) {
    let response = {};
    let err = {};
    let searchString = message.queryString;
    console.log("Search String " + searchString);
    let limit = message.limit;
    try {
        const users = await searchUsers(searchString, limit);
        response.status = 200;
        response.data = users;
        return callback(null, response);
    } catch (error) {
        console.log(error);
        err.status = 500;
        err.data = {
            code: error.code,
            msg: 'Unable to successfully get the search result! Please check the application logs for more details.'
        };
        return callback(err, null);
    }
}

async function searchUsers(searchString = "", limit = 20) {
    console.log("Search string " + searchString);
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




