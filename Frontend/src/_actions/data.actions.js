import axios from "axios";
import { SERVER_URL } from "../_constants";
import { DataActions } from "../_constants/data.contants";
import { ViewActions, ViewComponent } from "../_constants/view.constants";
import { fetchData } from "../_helper/datafetcher";
import { alertActions } from "./alert.actions";

export const dataActions = {
  refreshHomeData
};

function refreshHomeData(userId) {
  return async dispatch => {
    dispatch({ type: DataActions.REFRESH_HOME_DATA_START });
    try {
      const data = await fetchData(userId);
      dispatch({ type: DataActions.REFRESH_HOME_DATA, data });
    } catch (e) {
      console.log("Error occured while refreshing the data ", e);
      dispatch({ type: DataActions.REFRESH_HOME_DATA_FAILURE });
      dispatch(alertActions.error("Some error occured. Please try again"));
    } finally {
      dispatch({ type: DataActions.REFRESH_HOME_DATA_END });
    }
  }
}