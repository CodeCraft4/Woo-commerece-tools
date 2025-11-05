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
import { AdminProvider } from "../../context/AdminContext";
import { Slide2Provider } from "../../context/Slide2Context";
import { Slide3Provider } from "../../context/Slide3Context";
import { Slide4Provider } from "../../context/Slide4Context";
import { AdminCardEditorProvider } from "../../context/AdminEditorContext";
import { Slide1Provider } from "../../context/Slide1Context";
import GlobalWatermark from "../../components/GlobalWatermark/GlobalWatermark";

const App = () => {
  // React Query Client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60, 
        gcTime: 1000 * 60 * 60,
      },
    },
  });

  window.addEventListener("error", (e) =>
    console.error("Global error:", e.message)
  );
  window.addEventListener("unhandledrejection", (e) =>
    console.error("Promise rejection:", e.reason)
  );

  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <CartProvider>
              <WishCardProvider>
                {/* Fist Slide */}
                <Slide1Provider>
                  {/* Second Slide */}
                  <Slide2Provider>
                    {/* Third Slide */}
                    <Slide3Provider>
                      {/* Fourth Slide  */}
                      <Slide4Provider>
                        <AdminProvider>
                          <AdminCardEditorProvider>
                            <Router />
                          </AdminCardEditorProvider>
                        </AdminProvider>
                      </Slide4Provider>
                    </Slide3Provider>
                  </Slide2Provider>
                </Slide1Provider>

                {/* Global water mark */}
                <GlobalWatermark />

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
                        background: "#ecececff",
                        color: COLORS.black,
                      },
                    },

                    // error specific
                    error: {
                      style: {
                        background: "#9c1006ff",
                        color: COLORS.white,
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
