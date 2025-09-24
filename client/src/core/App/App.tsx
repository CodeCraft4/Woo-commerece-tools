import React from "react";
import Router from "../Router/Router";
import { WishCardProvider } from "../../context/WishCardContext";
import { ThemeProvider } from "@emotion/react";
import theme from "../../style/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const App = () => {
  // React Query Client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60,
      },
    },
  });

  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <WishCardProvider>
            <Router />
          </WishCardProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.Fragment>
  );
};

export default App;
