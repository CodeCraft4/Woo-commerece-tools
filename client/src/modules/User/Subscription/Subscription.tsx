import { Box, Container, Grid, Typography } from "@mui/material";
import Applayout from "../../../layout/Applayout";
import { useState } from "react";
import CustomButton from "../../../components/CustomButton/CustomButton";
import A4Img from "/assets/images/A4.png";
import PrevewCardImg from "/assets/images/preview-card.png";
import TableBgImg from "/assets/images/table.png";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51Qy8qWQOrHBOHXVwgcKXeKleaQbr43esHIWeeEuLCvE9SfmldVnMVYwnZVf72lHMKj6Hj6Pwh01ak5e7ZsTucB9I00xyfjVroR"
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
      const res = await fetch("https://cards-server-shahimad499-2660-imads-projects-8cd60545.vercel.app/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });

      const { id } = await res.json();

      const stripe:any = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: id });

    } catch (err) {
      console.error(err);
      alert("Payment failed!");
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
          height: "95vh",
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
            fontSize: "48px",
            fontWeight: "bold",
          }}
        >
          Go big and upgrade your card!
        </Typography>

        <Container maxWidth="xl">
          <Grid container spacing={3} sx={{ height: 600 }}>
            {/* Left Image */}
            <Grid
              size={7}
              sx={{
                backgroundImage:
                  `url(${TableBgImg})`,
                backgroundSize: "100% 100%",
                borderRadius: 7,
                border: "1px solid gray",
                position: "relative",
              }}
            >
              <Box
                component={"img"}
                src={A4Img}
                alt="A4Img"
                sx={{
                  position: "absolute",
                  bottom: 100,
                  left: 200,
                  width: 200,
                  height: 280,
                }}
              />
              <Box
                component={"img"}
                src={PrevewCardImg}
                alt="A4Img"
                sx={{
                  position: "absolute",
                  bottom: 100,
                  right: 100,
                  width: previewSizes[selectedPlan].width,
                  height: previewSizes[selectedPlan].height,
                  transition: "all 0.3s ease",
                }}
              />
            </Grid>

            {/* Right Side - Plans */}
            <Grid
              size={5}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "25px",
                textAlign: "start",
              }}
            >
              <Box sx={{ p: 2, bgcolor: "#e6f1e9", borderRadius: 2 }}>
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
                    border: `3px solid ${
                      selectedPlan === plan.id ? "#004099" : "transparent"
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
                      <Typography fontWeight={900}>{plan.title}</Typography>
                      <Typography fontSize={"13px"}>{plan.desc}</Typography>
                      <Typography variant="h5">£{plan.price}</Typography>
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
                  I accept the Terms & Conditions and give my consent to proceed with the order.
                </Typography>
              </Box>

              {/* Add to Pay button */}
              <CustomButton
                title="Add to Pay"
                width="100%"
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
  bgcolor: "#e9fbffff",
  p: 1,
  borderRadius: 2,
  boxShadow:'3px 7px 8px #eff1f1ff'
};
