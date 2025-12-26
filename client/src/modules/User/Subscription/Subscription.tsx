import { Box, Container, Grid, IconButton, Typography } from "@mui/material";
import Applayout from "../../../layout/Applayout";
import { useMemo, useState, useEffect } from "react";
import TableBgImg from "/assets/images/table.png";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { loadStripe } from '@stripe/stripe-js';
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { ArrowBackIos } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../../constant/color";

const stripePromise = loadStripe("pk_test_51S5Pnw6w4VLajVLTFff76bJmNdN9UKKAZ2GKrXL41ZHlqaMxjXBjlCEly60J69hr3noxGXv6XL2Rj4Gp4yfPCjAy00j41t6ReK");

type SizeKey = "a4" | "a5" | "us_letter";
type SelectedVariant = { key: SizeKey; title: string; price: number; basePrice: number };

// fallback math (kept for safety)
function computePrice(base: number, key: SizeKey) {
  if (key === "a5") return base + 2;
  if (key === "us_letter") return base + 4;
  return base;
}

const titleByKey: Record<SizeKey, string> = {
  a4: "A4 Card",
  a5: "A3 Card",
  us_letter: "US Letter",
};

const descByKey: Record<SizeKey, string> = {
  a4: "For the little message",
  a5: "IDEA Favourite",
  us_letter: "For a big impression",
};

const previewSizes: Record<SizeKey, { width: number; height: number; frameLabel: string }> = {
  a4: { width: 150, height: 200, frameLabel: "A4" },
  a5: { width: 200, height: 280, frameLabel: "A3" },
  us_letter: { width: 180, height: 232, frameLabel: "US Letter" },
};

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

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<SizeKey>("a4");
  const [basePrice, setBasePrice] = useState<number>(2); // fallback
  const [loading, setLoading] = useState(false);
  const [selectedPrices, setSelectedPrices] = useState<{ a4?: number; a5?: number; us_letter?: number } | null>(null);

  const slides = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("slides") || "{}"); }
    catch { return {}; }
  }, []);
  const firstSlideUrl: string | undefined = slides?.slide1;

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // hydrate from ProductPopup choice
    try {
      const raw = localStorage.getItem("selectedVariant");
      if (raw) {
        const parsed: SelectedVariant = JSON.parse(raw);
        if (parsed?.key) {
          setSelectedPlan(parsed.key);
          setBasePrice(Number.isFinite(parsed.basePrice) ? parsed.basePrice : 2);
        }
      }
    } catch { }

    // pull exact per-size prices saved by the modal
    try {
      const rawP = localStorage.getItem("selectedPrices");
      if (rawP) {
        const parsed = JSON.parse(rawP);
        setSelectedPrices(parsed);
      }
    } catch { }
  }, []);

  // prefer stored per-size prices; otherwise compute from base
  const priceFor = (k: SizeKey): number => {
    if (selectedPrices?.[k] != null && Number.isFinite(Number(selectedPrices[k]))) {
      return Number(selectedPrices[k]);
    }
    return computePrice(basePrice, k);
  };

  const plans = (["a4", "a5", "us_letter"] as SizeKey[]).map((k) => ({
    id: k,
    title: titleByKey[k],
    desc: descByKey[k],
    price: priceFor(k),
  }));

  const preview = previewSizes[selectedPlan];

  const handleStripeOrder = async (plan: { title: string; price: number }) => {
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
          metadata: { variantKey: selectedPlan },
        }),
      });
      if (!res.ok) throw new Error("checkout failed");
      const { id } = await res.json();

      const stripe: any = await stripePromise;
      toast.success("Navigate to Payment process");
      await stripe.redirectToCheckout({ sessionId: id });
    } catch {
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
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIos fontSize='large' sx={{ color: 'black' }} />
          </IconButton>{" "}
          Go big and upgrade your card!
        </Typography>

        <Container maxWidth="xl">
          <Grid container spacing={3} sx={{ height: { md: 600, sm: 600, xs: "auto" } }}>
            {/* Left Image */}
            <Grid
              size={{ md: 7, sm: 7, xs: 12 }}
              sx={{
                backgroundImage: `url(${TableBgImg})`,
                backgroundSize: { md: "100% 100%", sm: "100% 100%", xs: "100%" },
                borderRadius: 7,
                border: "1px solid gray",
                position: "relative",
                height: { md: "auto", sm: "auto", xs: 300 },
              }}
            >
              {/* Reference sheet with label that changes with selection */}
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
                <Box component={"img"} src={"/assets/images/A4.svg"} alt="Sheet" sx={{ width: "100%", height: "100%", borderRadius: 2, display: "block" }} />
                <Typography
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontWeight: 700,
                    pointerEvents: "none",
                    userSelect: "none",
                    fontSize: { md: 20, sm: 18, xs: 16 },
                    color: COLORS.seconday,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {preview.frameLabel}
                </Typography>
              </Box>

              {/* Dynamic preview */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: { md: 150, sm: 100, xs: 85 },
                  right: { md: 100, sm: 100, xs: 0 },
                  width: preview.width,
                  height: preview.height,
                  transition: "all 0.3s ease",
                }}
              >
                <Box component="img" src={"/assets/images/A4.svg"} alt="Preview frame" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 2, display: "block", pointerEvents: "none", userSelect: "none" }} />
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
            <Grid size={{ md: 5, sm: 5, xs: 12 }} sx={{ display: "flex", flexDirection: "column", gap: "25px", textAlign: "start" }}>
              <Box sx={{ p: { md: 2, sm: 2, xs: "5px" }, bgcolor: "#b7f7f4ff", borderRadius: 2 }}>
                <Typography variant="h5">🎉 We’ve saved your card design!</Typography>
              </Box>

              {plans.map((plan) => (
                <Box
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id as SizeKey);
                    try {
                      const newSel = {
                        key: plan.id as SizeKey,
                        title: plan.title,
                        price: plan.price,
                        basePrice, // keep for fallback
                      };
                      localStorage.setItem("selectedVariant", JSON.stringify(newSel));
                      localStorage.setItem("selectedSize", plan.id);
                    } catch { }
                  }}
                  sx={{
                    ...isActivePay,
                    border: `3px solid ${selectedPlan === plan.id ? "#004099" : "transparent"}`,
                    cursor: "pointer",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPlan === plan.id}
                      onChange={() => setSelectedPlan(plan.id as SizeKey)}
                      style={{ width: "30px", height: "30px" }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: { md: 900, sm: 900, xs: 700 } }}>{plan.title}</Typography>
                      <Typography sx={{ fontSize: "13px", sm: "13px", xs: "10px" }}>{plan.desc}</Typography>
                      <Typography sx={{ fontSize: { md: "auto", sm: "auto", xs: "15px" } }}>£{plan.price.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="h5">£{plan.price.toFixed(2)}</Typography>
                </Box>
              ))}

              {/* Terms */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input type="checkbox" style={{ width: "20px", height: "20px" }} />
                <Typography sx={{ fontSize: "14px", color: "gray" }}>
                  I accept the Terms & Conditions and give my consent to proceed with the order.
                </Typography>
              </Box>

              {/* Pay */}
              <LandingButton
                title="Add to Pay"
                width="100%"
                personal
                loading={loading}
                onClick={() => {
                  const plan = plans.find((p) => p.id === selectedPlan);
                  if (plan) {
                    localStorage.setItem("selectedSize", selectedPlan);
                    handleStripeOrder({ title: plan.title, price: plan.price });
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
