import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { GET_ERRORS, SET_CURRENT_CLIENT } from "./types";

//Register Client
export const registerClient = (clientData, history) => dispatch => {
  axios
    .post("/api/client/register", clientData)
    .then(res => history.push("/client/login"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};
//Login Client
export const loginClient = clientData => dispatch => {
  axios
    .post("/api/client/login", clientData)
    .then(res => {
      //Save to localStorage
      const { token } = res.data;
      // Set token to localStorage
      localStorage.setItem("jwtToken", token);
      // Set token to authHeader
      setAuthToken(token);
      // Decode token to get client data
      const decoded = jwt_decode(token);
      // Set current client
      dispatch(setCurrentClient(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const setCurrentClient = decoded => {
  return {
    type: SET_CURRENT_CLIENT,
    payload: decoded
  };
};

export const logoutClient = () => dispatch => {
  //Remove token from local stoargae
  localStorage.removeItem("jwtToken");
  // Remove auth header for future tokens
  setAuthToken(false);
  // Set current user to {}  which will set isAuthenicated to false
  dispatch(setCurrentClient({}));
};
