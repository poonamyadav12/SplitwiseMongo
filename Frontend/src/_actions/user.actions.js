import { SERVER_URL, userConstants } from '../_constants';
import { alertActions } from './';
import axios from 'axios';
import cookie from 'react-cookies';
import { history } from '../_helper/history.js';

export const userActions = {
    login,
    logout,
    register,
    update,
};

function login(username, password) {
    console.log("Login Action ");
    return async dispatch => {
        dispatch(request({ username }));
        const data = {
            id: username,
            password: password
        }
        //set the with credentials to true
        axios.defaults.withCredentials = true;
        //make a post request with the user data
        try {
            const response = await axios.post(SERVER_URL + '/user/login', data, {
                withCredentials: true,
            });
            history.push('/login');
            console.log("Login Action 1 ", response);
            dispatch(success(response.data));
        }
        catch (error) {
            console.log("Login Action 2 ", error);
            const code = error?.response?.data?.code;
            let msg = ["Some error occured, please try again."];
            if (!code && Array.isArray(data)) {
                msg = data.map(d => d.message);
            } else {
                switch (code) {
                    case "INVALID_LOGIN":
                        msg = ["Invalid user ID or password"];
                        break;
                    case "INVALID_USER_ID":
                        msg = ["Invalid user ID"];
                        break;
                    default:
                    // Do nothing
                }
            }
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(data) {
        return { type: userConstants.LOGIN_SUCCESS, data }
    }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    cookie.remove('cookie', { path: '/' });
    return ({ type: userConstants.LOGOUT });
}

function register(data) {
    return async dispatch => {
        dispatch(request(data));
        try {
            const response = await axios.post(SERVER_URL + '/user/signup', data);
            dispatch(success(response.data));
            history.push('/signup');
        } catch (error) {
            console.log("error in signup " + JSON.stringify(error));
            const data = error?.response?.data;
            const msg = (data && data?.code === 11000) ? ["User ID already exists, please login"] : Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }

    };

    function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
    function success(data) { return { type: userConstants.REGISTER_SUCCESS, data } }
    function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}

function update(data) {
    return async dispatch => {
        dispatch(request(data));
        try {
            const response = await axios.put(SERVER_URL + '/user/update', data);
            dispatch(success(response.data));
            dispatch(alertActions.success('User updated successfully'));
        } catch (error) {
            const data = error?.response?.data;
            let msg = ["Some error occured, please try again."];
            if (data && data?.code) {
                switch (data?.code) {
                    case "INVALID_USER_ID":
                        msg = ["Invalid user ID"];
                        break;
                    case "INVALID_PASSWORD":
                        msg = ["Invalid current password"];
                        break;
                    default:
                    // Fall through.
                }
            } else if (Array.isArray(data)) {
                msg = data.map(d => d.message);
            }
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }

    };

    function request(user) { return { type: userConstants.UPDATE_REQUEST, user } }
    function success(user) { return { type: userConstants.UPDATE_SUCCESS, user } }
    function failure(error) { return { type: userConstants.UPDATE_FAILURE, error } }
}
