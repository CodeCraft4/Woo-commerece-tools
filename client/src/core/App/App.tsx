import React from "react";
import Router from "../Router/Router";
import { WishCardProvider } from "../../context/WishCardContext";
import { ThemeProvider } from "@emotion/react";
import theme from "../../style/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/AddToCart";
import { Toaster } from "react-hot-toast";
import { COLORS } from "../../constant/color";

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
            <CartProvider>
              <WishCardProvider>
                <Router />
                <Toaster
                  position="bottom-right"
                  reverseOrder={false}
                  toastOptions={{
                    // global styles
                    style: {
                      borderRadius: "10px",
                      background: "#333",
                      color: "#fff",
                      width: "300px",
                      minHeight: "60px",
                      padding: "12px",
                      fontSize: "16px",
                    },

                    // success specific
                    success: {
                      style: {
                        background: "#f3f3f3ff",
                        color:COLORS.primary
                      },
                    },

                    // error specific
                    error: {
                      style: {
                        background: "#f44336",
                      },
                    },
                  }}
                />
              </WishCardProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.Fragment>
  );
};

export default App;
