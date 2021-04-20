//import the require dependencies
import { json, urlencoded } from 'body-parser';
//var cookieParser = require('cookie-parser');
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { getActivities, getActivitiesV2 } from './apis/activity_api';
import { createGroup, getAllGroupsForUser, getGroupDetails, joinGroup, leaveGroup, updateGroup } from './apis/group_api';
import { uploadImage } from './apis/image_upload';
import { addComment, createTransaction, getAllTransactionsForFriend, getAllTransactionsForGroup, getAllTransactionsForUser, settleTransactions, updateTransactions } from './apis/transactions_api';
import { createUser, getUsersBySearchString, updateExistingUser, validateLogin } from './apis/user_api';
const { checkAuth, auth } = require("./utils/passport");
const passport = require('passport');

var cookieParser = require('cookie-parser')
var app = express();

app.use(cookieParser());

app.set('view engine', 'ejs');

//use cors to allow cross origin resource sharing
app.use(cors({ origin: `${process.env.CLIENT_URL}:3000`, credentials: true }));

//use express session to maintain session data
app.use(session({
    secret: 'cmpe273_kafka_passport_mongo',
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration: 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration: 5 * 60 * 1000
}));

// Passport middleware
app.use(passport.initialize());
auth();

const mongoDB = require('./database/config');
const mongoose = require('mongoose');

console.log("mongoDb " + JSON.stringify(mongoDB.config.mongoDB));

// load app middlewares
app.use(json());
app.use(urlencoded({ extended: false }));

//Allow Access Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', `${process.env.CLIENT_URL}:3000`);
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 500,
    bufferMaxEntries: 0
};

mongoose.connect(mongoDB.config.mongoDB, options, (err, res) => {
    if (err) {
        console.log(err);
        console.log(`MongoDB Connection Failed`);
    } else {
        console.log(`MongoDB Connected`);

    }
});


//Route to handle CreateUser Post Request Call
app.post('/user/signup', createUser);

//Route to handle CreateUser Post Request Call
app.put('/user/update', checkAuth, updateExistingUser);

//Route to handle Login get Request Call
app.post('/user/login', validateLogin);

//Route to handle create group Request Call
app.post('/group/create', checkAuth, createGroup);

//Route to handle update group Request Call
app.post('/group/update', checkAuth, updateGroup);

//Route to handle leave group Request Call
app.post('/group/leave', checkAuth, leaveGroup);

//Route to handle join group Request Call
app.post('/group/join', checkAuth, joinGroup);

//Route to handle get group Request Call
app.get('/group/get', checkAuth, getGroupDetails);

//Route to handle get group Request Call
app.get('/group/transactions', checkAuth, getAllTransactionsForGroup);

//Route to handle get group Request Call
app.get('/user/groups', checkAuth, getAllGroupsForUser);

app.get('/user/search', checkAuth, getUsersBySearchString);

//Route to handle create txn Request Call
app.post('/transaction/create', checkAuth, createTransaction);

//Route to handle update txn Request Call
app.post('/transaction/update', checkAuth, updateTransactions);

//Route to handle settle transation
app.post('/transactions/settle', checkAuth, settleTransactions);

app.get('/transaction/friend', checkAuth, getAllTransactionsForFriend);

app.get('/user/activity', checkAuth, getActivities);

app.get('/user/activityv2', checkAuth, getActivitiesV2);

app.post('/image-upload', checkAuth, uploadImage);

app.get('/user/transactions', checkAuth, getAllTransactionsForUser);

app.post('/transaction/comment', checkAuth, addComment);

//Route to handle get group Request Call
//app.get('/groups/transactions', );

//start your server on port 3001
app.listen(3001);

console.log("Server Listening on port 3001");

export default app;