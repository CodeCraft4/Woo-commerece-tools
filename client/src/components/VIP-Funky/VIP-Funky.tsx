import { Box, Typography } from "@mui/material";
import { COLORS } from "../../constant/color";

const VIPFunky = () => {
  return (
    <Box sx={{ mt: 6, px: { md: 0, sm: 0, xs: 1 } }}>
      {/* Green panel */}
      <Box
        sx={{
          width: "100%",
          height: { md: 350, xs: 'auto' }, // fixed 350 for md/sm/xs
          bgcolor: COLORS.green,
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", sm: "column", md: "row" },
          alignItems: "stretch",
          justifyContent: "space-between",
          p: { md: 3, sm: 2.5, xs: 2 },
          gap: { md: 2, xs: 1.5 },
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Title + badge centered like screenshot */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#111",
                fontSize: { md: 34, sm: 28, xs: 22 },
                lineHeight: 1.1,
              }}
            >
              The DIY Personalisation App
            </Typography>

            <Box
              sx={{
                mt: 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "#000",
                color: "#fff",
                px: 5,
                py: 0.8,
                borderRadius: 2,
                fontSize: { md: 20, sm: 18, xs: 16 },
                fontWeight: 500,
              }}
            >
              Launching Soon <span style={{ fontSize: "1.1em" }}>🎉</span>
            </Box>
          </Box>

          {/* Body text */}
          <Box sx={{ px: { md: 1, xs: 0 } }}>
            <Typography
              sx={{
                color: "#111",
                fontSize: { md: 24, sm: 22, xs: 18 },
                lineHeight: 1.25,
                mb: 2,
              }}
            >
              Personalising on the go is about to get even easier.
            </Typography>

            <Typography
              sx={{
                color: "#111",
                fontSize: { md: 24, sm: 22, xs: 18 },
                lineHeight: 1.25,
                mb: 1,
              }}
            >
              Create and personalise cards, invites, gifts and more directly from
              your phone.
            </Typography>

            <Typography
              sx={{
                color: "#111",
                fontSize: { md: 24, sm: 22, xs: 18 },
                lineHeight: 1.25,
                mb: 1,
              }}
            >
              [ Join the waitlist ]
            </Typography>

            <Typography
              sx={{
                color: "#111",
                fontSize: { md: 24, sm: 22, xs: 18 },
                lineHeight: 1.25,
              }}
            >
              Be the first to know when the app launches.
            </Typography>
          </Box>
        </Box>

        {/* RIGHT (App image) */}
        <Box
          sx={{
            width: { xs: "100%", md: 420 },
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-end" },
          }}
        >
          <Box
            component="img"
            // use your best app photo here (phone mock)
            src="/assets/images/AppBanners.png"
            alt="App preview"
            sx={{
              height: { xs: 170, sm: 220, md: 320 }, // fits inside 350 panel
              width: "auto",
              objectFit: "contain",
              // slight “float” to match screenshot placement
              transform: { xs: "none", md: "translateY(6px)" },
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.25))",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default VIPFunky;
