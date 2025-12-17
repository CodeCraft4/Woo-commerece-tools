import { Box, Container, Grid, IconButton, Typography } from "@mui/material";
import Applayout from "../../../layout/Applayout";
import { useMemo, useState } from "react";
import TableBgImg from "/assets/images/table.png";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { loadStripe } from '@stripe/stripe-js';
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { ArrowBackIos } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../../constant/color";

const stripePromise = loadStripe(
  "pk_test_51S5Pnw6w4VLajVLTFff76bJmNdN9UKKAZ2GKrXL41ZHlqaMxjXBjlCEly60J69hr3noxGXv6XL2Rj4Gp4yfPCjAy00j41t6ReK");

// live key: 
// pk_live_51RPLagFqpxUy9vCxpTGqfngxVpbIOgogg8VY4pjGJBusMlc6XUDLmfeUxCFaWrKbFYxzPfybJMeu3aO7RrvSqFuN00zaRmAfgt

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("standard");
  const [loading, setLoading] = useState(false);

  const slides = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("slides") || "{}"); }
    catch { return {}; }
  }, []);
  const firstSlideUrl: string | undefined = slides?.slide1;

  const { user } = useAuth()
  const navigate = useNavigate();

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
      const res = await fetch("https://diypersonalisation.com/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: plan.title,
          price: plan.price,
          user: {
            email: user?.email,
            name: user?.user_metadata?.full_name || "User",
          },
        }),
      });

      const { id } = await res.json();

      const stripe: any = await stripePromise;
      toast.success("Navigate to Payment process");
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
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
          <IconButton onClick={() => navigate(-4)}>
            <ArrowBackIos fontSize='large' sx={{ color: 'black' }} />
          </IconButton> Go big and upgrade your card!
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
                sx={{
                  position: "absolute",
                  bottom: 150,
                  left: { md: 200, sm: 200, xs: 50 },
                  width: { md: 150, sm: 200, xs: 100 },
                  height: { md: 200, sm: 280, xs: 150 },
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 2,
                }}
              >
                <Box
                  component={"img"}
                  src={"/assets/images/A4.svg"}
                  alt="A4Img"
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 2,
                    display: "block",
                  }}
                />
                <Typography
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    m: 0,
                    p: 0,
                    fontWeight: 700,
                    pointerEvents: "none",
                    userSelect: "none",
                    fontSize: { md: 24, sm: 24, xs: 16 },
                    color: COLORS.seconday
                  }}
                >
                  A4
                </Typography>
              </Box>


              <Box
                sx={{
                  position: "absolute",
                  bottom: { md: 150, sm: 100, xs: 85 },
                  right: { md: 100, sm: 100, xs: 0 },
                  width: previewSizes[selectedPlan].width,
                  height: previewSizes[selectedPlan].height,
                  transition: "all 0.3s ease",
                }}
              >
                {/* A4 frame */}
                <Box
                  component="img"
                  src={"/assets/images/A4.svg"}
                  alt="A4 frame"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: 2,
                    display: "block",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />

                {/* Captured slide image placed inside the A4 */}
                <Box
                  component="img"
                  src={firstSlideUrl || ""}
                  alt="Your design"
                  sx={{
                    position: "absolute",
                    top: "18%",
                    left: "0%",
                    right: "0%",
                    bottom: "8%",
                    width: "auto",
                    height: "auto",
                    maxWidth: "85%",
                    maxHeight: "90%",
                    margin: "auto",
                    objectFit: "cover",
                    display: firstSlideUrl ? "block" : "none",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              </Box>
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
                    localStorage.setItem("selectedSize", plan.id);
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