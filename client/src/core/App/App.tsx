import React from "react";
import Router from "../Router/Router";
import { WishCardProvider } from "../../context/WishCardContext";

const App = () => {
  return (
    <React.Fragment>
      <WishCardProvider>
        <Router />
      </WishCardProvider>
    </React.Fragment>
  );
};

export default App;
