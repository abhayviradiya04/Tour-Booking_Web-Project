import React, { useEffect, useContext } from "react";
import "./App.css";
import Layout from "./components/Layout/Layout";
import { useNavigate } from "react-router-dom";
import AuthContext from "./context/AuthContext";

function App() {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const expirationTime = localStorage.getItem("expirationTime");

    if (user && expirationTime) {
      const currentTime = new Date().getTime();
      if (currentTime > expirationTime) {
        // Session has expired
        localStorage.removeItem("user");
        localStorage.removeItem("expirationTime");
        dispatch({ type: "LOGOUT" }); // Dispatch logout action
        navigate("/login"); // Redirect to login page
      } else {
        // User is still logged in
        dispatch({ type: "LOGIN_SUCCESS", payload: user });
      }
    }
  }, [dispatch, navigate]);

  return (
    <>
      <Layout />
    </>
  );
}

export default App;
