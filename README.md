# Splitwise web app prototype [Using MERN and Kafka]

## Problem statement
Build a prototype of Splitwise app. It shoud provide following functionalities

* User login and signup with avatar support.
* User can update their profile, change their avatar etc.
* User can create group and add new members to the group.
* User can update the group information.
* Once a user is added to a group, they should get an invitation to join the group. Group creator automatically becomes a member of the group
* Once a user accepts the group join invitation, they can add expenses to the group.
* User can add/update an expense in the group.
* User can add comment/delete comment on an expense.
* User can see the balance summary of the debts on the Dashboard View, Group View and Friend View.
* User can settle up the balance they owe to others and others owe to them as a cash transaction.
* User can see their recent activities.

## How to setup the app

### Create DB
Setup a DB on [MogoDB cloud](https://www.mongodb.com/cloud/atlas/lp/try2?utm_content=lp0421_control_try2&utm_source=google&utm_campaign=gs_americas_united_states_search_core_brand_atlas_desktop&utm_term=mongo%20db&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=12212624338&gclid=CjwKCAjwg4-EBhBwEiwAzYAlshR3mwe6yrqEbrkCJ6BCIJ03FIZ_3lkc7jU_FCI1rR26aJs1ZaRqrRoC0QoQAvD_BwE) with name SplitwiseDb.

Update the mongoDB URL here kafka-backend/config/config.js

### Install and Run Kafka

Follow https://kafka.apache.org/quickstart for installing and running kafka.

go to `kafka-backend/setupKafka.sh` and run the file on shell to create all the kafka topics.

### Run Kafka backend

#### Setup environment
Before running the server, setup configurations in `kafka-backend/config/config.js`. 

#### Run server
Please install node JS before below steps.

Go the the `kafka-backend/` directory and run `npm install`. This should setup the node_modules. If you get a build error in `node install` run `sudo apt-get install build-essential python` to install the required compiler deps.

To run the server, run `npm start`, server would be up and running on port 3001

### Run API backend

#### Setup environment
Before running the server, environment needs to be setup first. Copy the `/Backend/.env.example` file as `/Backend/.env` and replace with the correct values. 

#### Run server
Please install node JS before below steps.

Go the the `Backend/` directory and run `npm install`. This should setup the node_modules. If you get a build error in `node install` run `sudo apt-get install build-essential python` to install the required compiler deps.

To run the server, run `npm start`, server would be up and running on port 3001

### Run frontend

#### Setup environment
Before running the server, environment needs to be setup first. Change the server URL in the `Frontend/_constants/server.constants.js` 

#### Run server

Go the the `Frontend/` directory and run `npm install`. This should setup the node_modules. 

To run the server, run `npm start`, client would be up and running on port 3000

##### You can stop reading now if you know how to bootstrap a react app.

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
