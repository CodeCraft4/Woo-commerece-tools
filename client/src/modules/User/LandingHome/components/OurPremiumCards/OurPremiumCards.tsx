import React, { useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../../../../constant/color";
import { USER_ROUTES } from "../../../../../constant/route";
import { supabase } from "../../../../../supabase/supabase";
import { useQuery } from "@tanstack/react-query";


async function fetchCardsLight() {
  const { data, error } = await supabase
    .from("cards")
    .select("id,imageurl,accessplan,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function fetchTemplatesLight() {
  const { data, error } = await supabase
    .from("templetDesign")
    .select("id,img_url,accessplan,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

const SubscriptionModelSection: React.FC = () => {
  const navigate = useNavigate();

  const heroImage = "/assets/images/family.png";
  // const phoneMock = "/assets/images/phone-mock.png";

  const benefits = [
    "Unlimited premium designs",
    "Upload your own photos",
    "Exclusive birthday & seasonal bundles",
    "Instant downloads (print anytime)",
  ];

  const { data: cardData = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["allCards"],
    queryFn: fetchCardsLight,
    staleTime: 1000 * 60 * 10,
  });

  const { data: templateData = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["allTemplates"],
    queryFn: fetchTemplatesLight,
    staleTime: 1000 * 60 * 10,
  });

  // ✅ IMPORTANT: no setState here, useMemo instead
  const proItems = useMemo(() => {
    const cards = cardData
      .filter((x: any) => String(x.accessplan).toLowerCase() === "pro")
      .map((x: any) => ({
        key: `card:${x.id}`,
        type: "card",
        id: x.id,
        src: x.imageurl,
      }));

    const templates = templateData
      .filter((x: any) => String(x.accessplan).toLowerCase() === "pro")
      .map((x: any) => ({
        key: `template:${x.id}`,
        type: "template",
        id: x.id,
        src: x.img_url,
      }));

    // combine + keep only valid images
    const merged = [...cards, ...templates].filter((x) => !!x.src);

    // optional: latest first (already ordered, but mixed sources)
    return merged.slice(0, 8); // show max 8 (you can change)
  }, [cardData, templateData]);

  const isLoading = cardsLoading || templatesLoading;

  return (
    <Box
      sx={{
        maxWidth: "100%",
        mx: "auto",
        bgcolor: COLORS.white,
        borderRadius: 3,
        boxShadow: 5,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
          gap: { xs: 3, md: 0 },
          alignItems: "stretch",
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 4, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 34, sm: 42, md: 35 },
              fontWeight: 700,
              color: "#3A2B3A",
              lineHeight: 1.05,
              mb: 1.5,
            }}
          >
            Personalise your Premium Cards
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: 16, sm: 18, md: 20 },
              color: "#2B2B2B",
              lineHeight: 1.4,
              mb: 3,
              maxWidth: 520,
            }}
          >
            Unlock premium cards & Bundles and exclusive design with one simple plan.
          </Typography>

          <Box sx={{ display: "grid", gap: 1.6, mb: 3.5 }}>
            {benefits.map((txt) => (
              <Box key={txt} sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    bgcolor: COLORS.black,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#fff", fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontSize: { xs: 18, md: 22 }, color: "#222" }}>
                  {txt}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate(USER_ROUTES.PREMIUM_PLANS)}
            sx={{
              alignSelf: "flex-start",
              bgcolor: "#5B3C62",
              color: "#fff",
              px: 4,
              py: 1.3,
              borderRadius: 3,
              textTransform: "none",
              fontSize: { xs: 18, md: 20 },
              fontWeight: 700,
              boxShadow: "0 10px 20px rgba(91,60,98,0.35)",
              "&:hover": { bgcolor: "#4D3253" },
            }}
          >
            Choose your plan
          </Button>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            position: "relative",
            p: { xs: 2, sm: 3, md: 3.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "transparent",
          }}
        >
          <Box
            component="img"
            src={heroImage}
            alt="Subscription lifestyle"
            sx={{
              width: "100%",
              height: { xs: 260, sm: 360, md: 420 },
              objectFit: "cover",
              borderRadius: 5,
              borderTopLeftRadius: 70,
              boxShadow: "0 10px 25px rgba(0,0,0,0.14)",
            }}
          />

          {/* overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: 10, md: 4 },
              left: { xs: 10, md: 10 },
              right: { xs: 10, md: 16 },
              display: "flex",
              alignItems: "flex-end",
              gap: { xs: 1, md: 1.6 },
            }}
          >
            {/* ✅ REAL PRO items (cards + templates) */}
            <Box sx={{ display: "flex", gap: { xs: 1, md: 1.6 }, flex: 1 }}>
              {isLoading ? null : proItems.slice(0, 5).map((it) => (
                <Box
                  key={it.key}
                  sx={{
                    position: "relative", // ✅ correct
                    width: { xs: 80, sm: 90, md: 110 },
                    height: { xs: 120, sm: 140, md: 160 },
                    flexShrink: 0,
                  }}
                >
                  {/* frame */}
                  <Box
                    component="img"
                    src="/assets/images/A4.svg"
                    alt="frame"
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                    }}
                  />

                  {/* thumbnail */}
                  <Box
                    component="img"
                    src={it.src}
                    alt={it.key}
                    sx={{
                      position: "absolute",
                      top: 18,
                      left: 6,
                      right: 10,
                      bottom: 12,
                      width: "calc(100% -10px)",
                      height: "calc(100% - 22px)",
                      objectFit: "cover",
                      boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                      bgcolor: "#fff",
                    }}
                  />
                </Box>
              ))}
            </Box>


            {/* <Box
                component="img"
                src={phoneMock}
                alt="Phone mock"
                sx={{
                  width: { xs: 62, sm: 74, md: 86 },
                  height: "auto",
                  filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.22))",
                }}
              /> */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SubscriptionModelSection;
