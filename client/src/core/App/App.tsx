import React from "react";
import Router from "../Router/Router";
import { WishCardProvider } from "../../context/WishCardContext";
import { ThemeProvider } from "@emotion/react";
import theme from "../../style/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../context/AuthContext";

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
          <AuthProvider>
          <WishCardProvider>
            <Router />
          </WishCardProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.Fragment>
  );
};

export default App;
