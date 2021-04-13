import { alertConstants } from '../_constants';

export const alertActions = {
    success,
    error,
    clear
};

function success(messages) {
    return { type: alertConstants.SUCCESS, messages };
}

function error(messages) {
    return { type: alertConstants.ERROR, messages };
}

function clear() {
    return { type: alertConstants.CLEAR };
}