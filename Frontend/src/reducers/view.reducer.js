import { ViewActions, ViewComponent } from "../_constants/view.constants";

const initialState = { viewComponent: ViewComponent.DASHBOARD };
export function view(state = initialState, action) {
  switch (action.type) {
    case ViewActions.SET_VIEW:
      return action.data;
    default:
      return state;
  }
}