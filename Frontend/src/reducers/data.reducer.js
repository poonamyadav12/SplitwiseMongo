import { DataActions } from '../_constants/data.contants';

const initialState = {};
export function data(state = initialState, action) {
  switch (action.type) {
    case DataActions.REFRESH_HOME_DATA:
      return action.data;
    default:
      return state;
  }
}
