import { ViewActions, ViewComponent } from "../_constants/view.constants";

export const viewActions = {
  setFriendView,
  setGroupView,
  setDashboardView,
  setActivityView,
};

function setDashboardView() {
  return dispatch => {
    dispatch({ type: ViewActions.SET_VIEW, data: { viewComponent: ViewComponent.DASHBOARD } })
  }
}

function setGroupView(groupId) {
  return dispatch => {
    dispatch({ type: ViewActions.SET_VIEW, data: { viewComponent: ViewComponent.GROUPVIEW, groupViewData: { groupId } } })
  }
}

function setFriendView(friend) {
  return dispatch => {
    dispatch({ type: ViewActions.SET_VIEW, data: { viewComponent: ViewComponent.FRIENDVIEW, friendViewData: { friend } } })
  }
}

function setActivityView(userId) {
  return dispatch => {
    dispatch({ type: ViewActions.SET_VIEW, data: { viewComponent: ViewComponent.RECENTACTIVITYVIEW, activityViewData: { userId } } })
  }
}