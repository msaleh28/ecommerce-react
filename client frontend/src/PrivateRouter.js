import React from "react";
import { Navigate, Route } from "react-router-dom";

function PrivateRouter({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      component={(props) => {
        const token = window.localStorage.getItem("userInfo");
        if (token) {
          return <Component {...props} />;
        } else {
          return <Navigate to={"/login"} />;
        }
      }}
    />
  );
}

export default PrivateRouter;
