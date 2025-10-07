import { useCart } from "../../../context/AddToCart";
import { Box, Button, IconButton, Typography } from "@mui/material";
import MainLayout from "../../../layout/MainLayout";
import { Close, KeyboardArrowLeft } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LandingButton from "../../../components/LandingButton/LandingButton";
// import { loadStripe, type Stripe } from "@stripe/stripe-js";
// import { useState } from "react";
// import toast from "react-hot-toast";

// const stripePromise = loadStripe(
//   "pk_test_51Qy8qWQOrHBOHXVwgcKXeKleaQbr43esHIWeeEuLCvE9SfmldVnMVYwnZVf72lHMKj6Hj6Pwh01ak5e7ZsTucB9I00xyfjVroR"
// );

const AddToCart = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // for Total Produts coutn & Total Price
  // for Total Products count & Total Price
  const totalProducts = cart.length;

  const totalPrice = cart.reduce((sum, item) => {
    // Convert price to number safely
    let price = 0;

    if (typeof item.price === "number") {
      price = item.price;
    } else if (typeof item.price === "string") {
      // Remove everything except digits and dot
      const numericValue = item.price.replace(/[^0-9.]/g, "");
      price = parseFloat(numericValue) || 0;
    }

    return sum + price;
  }, 0);

  // Modify this to get your Stripe Price IDs
  // Assuming your cart items now include a 'stripePriceId'
  // const lineItems = cart.map((item) => ({
  //   price: item.price, // Use the Price ID here
  //   quantity: 1,
  // }));

  // const handleStripeSubscription = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(
  //       "http://localhost:5000/create-subscription-session",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ items: lineItems }),
  //       }
  //     );

  //     const { id } = await res.json();
  //     const stripe = await stripePromise;
  //     await stripe.redirectToCheckout({ sessionId: id });
  //   } catch (err) {
  //     console.error("Stripe subscription error:", err);
  //    toast.error("Payment Process field")
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  console.log(totalPrice, "-");

  return (
    <MainLayout>
      <Box mt={10}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
          }}
        >
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <IconButton onClick={() => navigate(-1)}>
              <KeyboardArrowLeft fontSize="large" />
            </IconButton>
            <Typography variant="h4" gutterBottom>
              🛒 Your Basket
            </Typography>
          </Box>

          <LandingButton
            title=" Clear Basket"
            onClick={clearCart}
            personal
            variant="outlined"
          />
        </Box>

        <Box sx={{ width: "100%", overflowY: "auto", height: 700 }}>
          {cart.length === 0 ? (
            <Typography
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                m: "auto",
                width: "100%",
                color: "gray",
                fontSize: "20px",
              }}
            >
              Your basket is empty.
            </Typography>
          ) : (
            <>
              {cart.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #ddd",
                    py: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      component={"img"}
                      src={item.img}
                      alt={item.title}
                      width={80}
                      height={80}
                      borderRadius={1}
                    />
                    <Typography>{item.title || "No title"}</Typography>
                  </Box>
                  <Typography fontSize={"20px"}> £{item.price}</Typography>
                  <Button
                    color="error"
                    onClick={() => item?.id && removeFromCart(item.id)}
                  >
                    <Close />
                  </Button>
                </Box>
              ))}
            </>
          )}
        </Box>
        {cart.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              mx: "auto",
              mb: 8,
            }}
          >
            <Box
              sx={{
                p: 3,
                width: 400,
                height: 200,
                border: "1px solid #212",
                borderRadius: 2,
                mt: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography fontSize={"22px"} fontWeight={"bold"}>
                  Total Products
                </Typography>
                <Typography fontSize={"15px"}>{totalProducts}</Typography>
              </Box>
              <br />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography fontSize={"22px"} fontWeight={"bold"}>
                  Total Price
                </Typography>
                <Typography fontSize={"15px"}>
                  £{totalPrice.toFixed(0)}
                </Typography>
              </Box>
              <br />
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <LandingButton
                  title="Add To Pay"
                  width="300px"
                  personal
                  // loading={loading}
                  // onClick={handleStripeSubscription}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default AddToCart;
