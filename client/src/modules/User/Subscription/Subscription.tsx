import { Box, Container, Grid, Typography } from "@mui/material";
import Applayout from "../../../layout/Applayout";
import { useState } from "react";
import A4Img from "/assets/images/A4.png";
import PrevewCardImg from "/assets/images/preview-card.png";
import TableBgImg from "/assets/images/table.png";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { loadStripe } from '@stripe/stripe-js';
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  "pk_test_51S5Pnw6w4VLajVLTFff76bJmNdN9UKKAZ2GKrXL41ZHlqaMxjXBjlCEly60J69hr3noxGXv6XL2Rj4Gp4yfPCjAy00j41t6ReK"
);

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("standard");
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: "standard",
      title: "Standard",
      desc: "For the little message",
      price: 1,
    },
    { id: "large", title: "Large", desc: "IDEA Favourite", price: 3 },
    { id: "giant", title: "Giant", desc: "For a big impression", price: 5 },
  ];

  const previewSizes: Record<string, { width: number; height: number }> = {
    standard: { width: 150, height: 200 },
    large: { width: 200, height: 280 },
    giant: { width: 250, height: 320 },
  };

  const handleStripeOrder = async (plan: any) => {
    setLoading(true);
    try {
      const res = await fetch("https://tools-61cbdi9z2-imads-projects-8cd60545.vercel.app/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });

      const { id } = await res.json();

      const stripe: any = await stripePromise;
      toast.success("Navigate to Payment process");
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
      console.error(err);
      toast.error("Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Applayout>
      <Box
        sx={{
          bgcolor: "white",
          width: "100%",
          height: { md: "95vh", sm: "95vh", xs: "auto" },
          display: "flex",
          alignItems: "start",
          flexDirection: "column",
          justifyContent: "center",
          m: "auto",
        }}
      >
        <Typography
          sx={{
            p: 2,
            textAlign: "start",
            fontSize: { md: "48px", sm: "48px", xs: "20px" },
            fontWeight: "bold",
          }}
        >
          Go big and upgrade your card!
        </Typography>

        <Container maxWidth="xl">
          <Grid
            container
            spacing={3}
            sx={{ height: { md: 600, sm: 600, xs: "auto" } }}
          >
            {/* Left Image */}
            <Grid
              size={{ md: 7, sm: 7, xs: 12 }}
              sx={{
                backgroundImage: `url(${TableBgImg})`,
                backgroundSize: {
                  md: "100% 100%",
                  sm: "100% 100%",
                  xs: "100%",
                },
                borderRadius: 7,
                border: "1px solid gray",
                position: "relative",
                height: { md: "auto", sm: "auto", xs: 300 },
              }}
            >
              <Box
                component={"img"}
                src={A4Img}
                alt="A4Img"
                sx={{
                  position: "absolute",
                  bottom: 100,
                  left: { md: 200, sm: 200, xs: 50 },
                  width: { md: 200, sm: 200, xs: 100 },
                  height: { md: 280, sm: 280, xs: 150 },
                }}
              />
              <Box
                component={"img"}
                src={PrevewCardImg}
                alt="A4Img"
                sx={{
                  position: "absolute",
                  bottom: { md: 100, sm: 100, xs: 85 },
                  right: { md: 100, sm: 100, xs: 0 },
                  width: previewSizes[selectedPlan].width,
                  height: previewSizes[selectedPlan].height,
                  transition: "all 0.3s ease",
                }}
              />
            </Grid>

            {/* Right Side - Plans */}
            <Grid
              size={{ md: 5, sm: 5, xs: 12 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "25px",
                textAlign: "start",
              }}
            >
              <Box
                sx={{
                  p: { md: 2, sm: 2, xs: "5px" },
                  bgcolor: "#b7f7f4ff",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h5">
                  🎉 We’ve saved your card design!
                </Typography>
              </Box>

              {plans.map((plan) => (
                <Box
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  sx={{
                    ...isActivePay,
                    border: `3px solid ${selectedPlan === plan.id ? "#004099" : "transparent"
                      }`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPlan === plan.id}
                      onChange={() => setSelectedPlan(plan.id)}
                      style={{ width: "30px", height: "30px" }}
                    />
                    <Box>
                      <Typography
                        sx={{ fontWeight: { md: 900, sm: 900, xs: 700 } }}
                      >
                        {plan.title}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "13px", sm: "13px", xs: "10px" }}
                      >
                        {plan.desc}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { md: "auto", sm: "auto", xs: "15px" },
                        }}
                      >
                        £{plan.price}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h5">£{plan.price}</Typography>
                </Box>
              ))}

              {/* Terms checkbox */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="checkbox"
                  style={{ width: "20px", height: "20px" }}
                />
                <Typography sx={{ fontSize: "14px", color: "gray" }}>
                  I accept the Terms & Conditions and give my consent to proceed
                  with the order.
                </Typography>
              </Box>

              {/* Add to Pay button */}
              <LandingButton
                title="Add to Pay"
                width="100%"
                personal
                loading={loading}
                onClick={() => {
                  const plan = plans.find((p) => p.id === selectedPlan);
                  if (plan) {
                    handleStripeOrder(plan);
                  }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Applayout>
  );
};

export default Subscription;

const isActivePay = {
  display: "flex",
  gap: "4px",
  justifyContent: "space-between",
  alignItems: "center",
  bgcolor: "#cdf0c06a",
  p: "3px",
  borderRadius: 2,
  boxShadow: "3px 7px 8px #eff1f1ff",
};