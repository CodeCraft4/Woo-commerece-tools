import React from "react";
import Router from "../Router/Router";
import { WishCardProvider } from "../../context/WishCardContext";
import { ThemeProvider } from "@emotion/react";
import theme from "../../style/theme";

const App = () => {
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
      <WishCardProvider>
        <Router />
      </WishCardProvider>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
