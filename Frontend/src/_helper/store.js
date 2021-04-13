import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers';
import axios from 'axios';

const loggerMiddleware = createLogger();
const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
export const store = createStore(
    rootReducer,
    composeEnhancers(
        applyMiddleware(
            thunkMiddleware,
            loggerMiddleware
        ))
);

// Add a request interceptor
axios.interceptors.request.use(function (config) {
    const token = store.getState().authentication.token;
    config.headers.Authorization = `Bearer ${token}`;
    // config.headers.common['authorization'] = token;
    if (token) config.withCredentials = true;

    return config;
});