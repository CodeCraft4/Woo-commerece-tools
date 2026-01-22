// src/pages/.../PremiumPlans.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../../layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBackIos, CheckCircleOutline, HighlightOff } from "@mui/icons-material";
import { loadSubscriptionConfig } from "../../../lib/subscriptionStore";
import { supabase } from "../../../supabase/supabase";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * TYPES
 */
type FeatureIconKind = "check" | "cross";
type PricingFeature = { id: string; text: string; icon: FeatureIconKind };
type PricingPlan = {
  id: string;
  code: string; // free | bundle | pro
  name: string;
  tagline: string;
  priceText: string;
  priceSuffix: string;
  highlight: boolean;
  badgeText: string;
  features: PricingFeature[];
};
type PricingConfig = { page: { title: string; subtitle: string }; plans: PricingPlan[] };

const API_BASE_URL = "http://localhost:5000";
const STRIPE_PK =
  "pk_test_51S5Pnw6w4VLajVLTFff76bJmNdN9UKKAZ2GKrXL41ZHlqaMxjXBjlCEly60J69hr3noxGXv6XL2Rj4Gp4yfPCjAy00j41t6ReK";

const stripePromise = loadStripe(STRIPE_PK);

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "—";
  const d = new Date(expiresAt);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FeatureIcon({ kind, highlight }: { kind: FeatureIconKind; highlight: boolean }) {
  if (kind === "cross") return <HighlightOff fontSize="small" color={highlight ? "warning" : "error"} />;
  return <CheckCircleOutline fontSize="small" color={highlight ? "warning" : "action"} />;
}

/**
 * Plan-wise visuals (Admin-like)
 * - pro    => pink + white gradient + pink badge
 * - bundle => white + orange gradient + orange badge
 * - free   => normal paper, no gradient
 */
function getPlanVisual(planCode: string, isFree: boolean) {
  if (isFree) {
    return {
      backgroundImage: "none",
      bgcolor: "background.paper" as const,
      badgeSx: { bgcolor: "rgba(0,0,0,0.10)", color: "text.primary" as const },
    };
  }

  const code = (planCode || "").toLowerCase();

  if (code === "pro") {
    return {
      backgroundImage: "linear-gradient(135deg, #ffffff 0%, #ffe3f3 50%, #ff8a00 120%)",
      bgcolor: "transparent" as const,
      badgeSx: { bgcolor: "#ff8a00", color: "#ffffff" },
    };
  }

  if (code === "bundle") {
    return {
      backgroundImage: "linear-gradient(135deg, #ffffff 0%, #fff0dc 50%, #56BECC 120%)",
      bgcolor: "transparent" as const,
      badgeSx: { bgcolor: "#56BECC", color: "#ffffff" },
    };
  }

  // fallback for any other paid plan
  return {
    backgroundImage: "linear-gradient(135deg, #ffffff 0%, #e4dce9 50%, #ae8ec2 100%)",
    bgcolor: "transparent" as const,
    badgeSx: { bgcolor: "warning.main", color: "warning.contrastText" as const },
  };
}

function PlanCardView({
  plan,
  isFree,
  showBuyButton,
  onBuy,
  buying,
}: {
  plan: PricingPlan;
  isFree: boolean;
  showBuyButton: boolean;
  onBuy: () => void;
  buying: boolean;
}) {
  const badgeText = (plan.badgeText || "").trim();
  const visual = getPlanVisual(plan.code, isFree);

  return (
    <Card
      elevation={plan.highlight ? 10 : 2}
      sx={{
        borderRadius: 3,
        height: "100%",
        position: "relative",
        border: plan.highlight ? "3px solid" : "1px solid",
        borderColor: plan.highlight ? "warning.main" : "divider",
        overflow: "visible",
        mt: 4,
        width: "100%",
        backgroundImage: visual.backgroundImage,
        bgcolor: visual.bgcolor,
      }}
    >
      {/* ✅ Admin-like badge (top center) */}
      {badgeText ? (
        <Box
          sx={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 0.6,
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 0.4,
              boxShadow: 1,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.10)",
              userSelect: "none",
              whiteSpace: "nowrap",
              ...visual.badgeSx,
            }}
          >
            {badgeText}
          </Box>
        </Box>
      ) : null}

      <CardContent sx={{ p: 2.5, pt: badgeText ? 4 : 2.5 }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography sx={{ fontSize: { md: 28, xs: 22 }, fontWeight: 900 }}>{plan.name}</Typography>
            <Typography sx={{ color: "gray", fontSize: 14, mt: 0.5 }}>{plan.tagline}</Typography>
          </Box>

          <Box>
            <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
              <Typography sx={{ fontSize: { md: 34, xs: 28 }, fontWeight: 900 }}>{plan.priceText}</Typography>
              {plan.priceSuffix ? (
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary" }}>
                  {plan.priceSuffix}
                </Typography>
              ) : null}
            </Stack>
          </Box>

          <Divider />

          <List dense sx={{ py: 0 }}>
            {(plan.features || []).map((f) => (
              <ListItem key={f.id} sx={{ px: 0, gap: 1 }} disableGutters>
                <ListItemIcon sx={{ minWidth: 34, mt: 0.3 }}>
                  <FeatureIcon kind={f.icon} highlight={plan.highlight} />
                </ListItemIcon>
                <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{f.text}</Typography>
              </ListItem>
            ))}
          </List>

          {showBuyButton ? (
            <Button
              variant="contained"
              disabled={buying}
              onClick={onBuy}
              sx={{ borderRadius: 999, py: 1.3, fontWeight: 900, textTransform: "none", mt: 1 }}
              color={plan.highlight ? "warning" : "primary"}
            >
              {buying ? "Redirecting..." : "Buy Plan"}
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function PremiumPlans() {
  const { user, premiumActive, premiumExpiresAt, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [config, setConfig] = useState<PricingConfig | null>(null);

  const expiryText = useMemo(() => formatExpiry(premiumExpiresAt), [premiumExpiresAt]);

  // ✅ avoid double confirm calls (React strict mode)
  const confirmRanRef = useRef(false);

  // ✅ load plans config
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const remote = await loadSubscriptionConfig<PricingConfig>(supabase);
        setConfig(remote ?? null);
        setLoading(false);
      } catch (e: any) {
        setLoading(false);
        toast.error(e?.message || "Failed to load subscription config.");
      }
    };
    run();
  }, []);

  // ✅ after Stripe redirects back: confirm subscription using session_id
  useEffect(() => {
    const runConfirm = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      if (!sessionId) return;
      if (confirmRanRef.current) return;
      confirmRanRef.current = true;

      const toastId = "confirm-premium";

      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw new Error(sessionErr.message);

        const token = sessionData?.session?.access_token;
        if (!token) throw new Error("Please login again.");

        toast.loading("Activating your premium...", { id: toastId });

        const res = await fetch(`${API_BASE_URL}/subscription/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Confirm failed.");

        await refreshProfile();
        toast.success("Premium activated ✅", { id: toastId });

        // clean URL
        params.delete("session_id");
        const clean = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
        window.history.replaceState({}, "", clean);
      } catch (e: any) {
        toast.error(e?.message || "Failed to activate premium.", { id: toastId });
      }
    };

    void runConfirm();
  }, [refreshProfile]);

  // refresh profile when user is available
  useEffect(() => {
    if (user?.id) void refreshProfile();
  }, [user?.id, refreshProfile]);

  const startCheckout = async (planCode: string) => {
    const toastId = "checkout";
    try {
      setBuying(planCode);

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) throw new Error(sessionErr.message);

      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Please login first.");

      toast.loading("Navigating to checkout...", { id: toastId });

      const res = await fetch(`${API_BASE_URL}/subscription/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planCode }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to create checkout session.");

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load.");

      toast.success("Redirecting...", { id: toastId });

      const { error } = await stripe.redirectToCheckout({ sessionId: json.id });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e?.message || "Checkout failed.", { id: toastId });
      setBuying(null);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ width: "100%", py: 4, pb: { md: 15, xs: 4 } }}>
        <Container maxWidth="xl">
          <IconButton sx={{ border: "1px solid gray" }} onClick={() => navigate(-1)}>
            <ArrowBackIos />
          </IconButton>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : null}

          {/* ✅ Premium user: only show message */}
          {premiumActive ? (
            <Box sx={{ textAlign: "center", mt: 6 }}>
              <Card
                elevation={6}
                sx={{
                  mx: "auto",
                  maxWidth: 820,
                  borderRadius: 3,
                  backgroundImage: "linear-gradient(135deg, #ffffff 0%, #e4dce9 50%, #ae8ec2 100%)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent sx={{ py: 4 }}>
                  <Stack spacing={1.2}>
                    <Typography sx={{ fontSize: { md: 36, xs: 26 }, fontWeight: 1000 }}>🎉 You are a Pro User</Typography>
                    <Typography sx={{ fontSize: { md: 16, xs: 14 }, fontWeight: 700, color: "text.secondary" }}>
                      Your premium access is active. Enjoy unlimited designs & PDFs.
                    </Typography>
                    <Typography sx={{ fontSize: { md: 20, xs: 16 }, fontWeight: 900 }}>
                      Expiry: <Box component="span" sx={{ fontWeight: 900 }}>{expiryText}</Box>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ) : null}

          {/* ✅ Non-premium: show plans */}
          {!premiumActive && config ? (
            <Box sx={{ textAlign: "center", mt: 5 }}>
              <Typography sx={{ fontSize: { md: 40, xs: 28 }, fontWeight: 900 }}>
                {config.page?.title || "Plans"}
              </Typography>

              <Typography
                sx={{
                  fontSize: { md: 18, xs: 14 },
                  width: { md: 820, xs: "100%" },
                  color: "#444444",
                  mx: "auto",
                  mt: 1,
                }}
              >
                {config.page?.subtitle || ""}
              </Typography>

              <Box
                sx={{
                  width: "80%",
                  display: "flex",
                  gap: 3,
                  flexWrap: { xs: "wrap", md: "nowrap" },
                  m: "auto",
                  mt: 4,
                }}
              >
                {(config.plans || []).map((plan) => {
                  const isFree = plan.code === "free" || plan.priceText?.toLowerCase() === "free";
                  return (
                    <Box key={plan.id} sx={{ width: "100%" }}>
                      <PlanCardView
                        plan={plan}
                        isFree={isFree}
                        showBuyButton={!isFree}
                        buying={buying === plan.code}
                        onBuy={() => startCheckout(plan.code)}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : null}
        </Container>
      </Box>
    </MainLayout>
  );
}
