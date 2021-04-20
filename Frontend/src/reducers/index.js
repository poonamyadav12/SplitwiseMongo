import { combineReducers } from 'redux';

import { authentication } from './authentication.reducer';
import { registration } from './registration.reducer';
//import { users } from './users.reducer';
import { alert } from './alert.reducer';
import { update } from './update.reducer';
import { view } from './view.reducer';
import { data } from './data.reducer';

const rootReducer = combineReducers({
    authentication,
    registration,
    alert,
    update,
    view,
    data,
});

export default rootReducer;