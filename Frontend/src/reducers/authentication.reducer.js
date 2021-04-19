import { userConstants } from '../_constants';

let user = JSON.parse(localStorage.getItem('user'));
// let user = localStorage.getItem('user');
let token = localStorage.getItem('token');
const initialState = user && token ? { loggedIn: true, user, token } : {};

export function authentication(state = initialState, action) {
    switch (action.type) {
        case userConstants.LOGIN_REQUEST:
            return {
                loggingIn: true,
            };
        case userConstants.LOGIN_SUCCESS:
        case userConstants.REGISTER_SUCCESS:
            localStorage.setItem('user', JSON.stringify(action.data.user));
            localStorage.setItem('token', action.data.token);
            return {
                loggedIn: true,
                user: action.data.user,
                token: action.data.token,
            };
        case userConstants.UPDATE_SUCCESS:
            localStorage.setItem('user', JSON.stringify(action.user));
            return {
                loggedIn: true,
                user: action.user,
                token: state.token,
            };
        case userConstants.LOGIN_FAILURE:
            return {};
        case userConstants.LOGOUT:
            localStorage.setItem('user', null);
            localStorage.setItem('token', null);
            return {};
        default:
            return state
    }
}