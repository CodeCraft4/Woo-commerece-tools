import { Box, List, ListItem, Typography } from "@mui/material";
import { COLORS } from "../../../constant/color";
import { FooterLinks, PAYMENT_CARD } from "../../../constant/data";
import { useAuth } from "../../../context/AuthContext";
import { USER_ROUTES } from './../../../constant/route';

const Footer = () => {
  const { user } = useAuth()
  return (
    <Box
      sx={{
        display: { md: "flex", sm: "", xs: "block" },
        width: { lg: "1340px", md: "100%", sm: "100%", xs: "100%" },
        m: "auto",
        flexDirection: "column",
        p: { lg: 2, md: 1, sm: 1, xs: 2 },
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: { md: "flex", sm: "flex", xs: "block" },
          width: "100%",
          justifyContent: "space-between",
          borderBottom: "2px solid black",
          pb: 5,
        }}
      >
        {FooterLinks.map((e) => (
          <Box key={e.title} p={{ md: 0, sm: 0, xs: 1 }}>
            <Typography
              sx={{
                fontSize: { lg: "20px", md: "20px", sm: "15px", xs: "auto" },
                fontWeight: 800,
                color: COLORS.seconday,
              }}
            >
              {e.title}
            </Typography>
            <List>
              {e.links.map((link) => (
                <ListItem
                  key={link.name}
                  sx={{
                    fontSize: { md: "18px", sm: "14px", xs: "14px" },
                    mb: { md: 1.5, sm: 1.5, xs: "auto" },
                    textAlign: "start",
                    px: 0,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  <a
                    href={!user ? USER_ROUTES.SIGNIN : link.path}
                    style={{ textDecoration: "none", color: COLORS.black }}
                  >
                    {link.name}
                  </a>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: { md: "flex", sm: "flex", xs: "block" },
          width: "100%",
          mt: 5,
        }}
      >
        <Box sx={{ width: { lg: "50%", md: "100%", sm: "100%", xs: "100%" } }}>
          <Typography
            sx={{
              fontSize: { lg: "20px", md: "20px", sm: "17px", xs: "auto" },
              fontWeight: 800,
            }}
          >
            Let's get Social
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
              mt: 3,
              mb: 3,
            }}
          >
            <a href="#">
              <Box
                component={"img"}
                src="/assets/icons/facebook.svg"
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: 50,
                }}
              />
            </a>
            <a href="#">
              <Box
                component={"img"}
                src="/assets/icons/tiktok.svg"
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: 50,
                }}
              />
            </a>
            <a href="#">
              <Box
                component={"img"}
                src="/assets/icons/instagram.svg"
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: 50,
                }}
              />
            </a>
            <a href="#">
              <Box
                component={"img"}
                src="/assets/icons/youtube.svg"
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: 50,
                }}
              />
            </a>
            <a href="#">
              <Box
                component={"img"}
                src="/assets/icons/DIYP.svg"
                sx={{
                  width: "35px",
                  height: "35px",
                  borderRadius: 50,
                }}
              />
            </a>
          </Box>
        </Box>

        <Box sx={{ width: { lg: "50%", md: "100%", sm: "100%", xs: "100%" } }}>
          <Typography
            sx={{
              fontSize: { lg: "20px", md: "20px", sm: "17px", xs: "auto" },
              fontWeight: 800,
            }}
          >
            Download the App
          </Typography>

          <Box
            sx={{
              display: { md: "flex", sm: "block", xs: "block" },
              mt: 3,
              width: { lg: "70%", md: "100%", sm: "90%", xs: "100%" },
            }}
          >
            <Box
              sx={{
                height: "50px",
                borderRadius: 4,
                bgcolor: COLORS.black,
                color: COLORS.white,
                px: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                m: "auto",
                gap: 2,
                mb: { md: 0, sm: 1, xs: 2 },
              }}
            >
              <Box
                component={"img"}
                src="/assets/icons/Apple.svg"
                sx={{ width: 30 }}
              />
              <Box>
                <Typography fontSize={"10px"}>Download on the</Typography>
                <Typography variant="h6">App Store</Typography>
              </Box>
            </Box>
            <Box
              sx={{
                height: "50px",
                borderRadius: 4,
                bgcolor: COLORS.black,
                color: COLORS.white,
                px: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                m: "auto",
                gap: 2,
              }}
            >
              <Box
                component={"img"}
                src="/assets/icons/Playstore.svg"
                sx={{ width: 30 }}
              />
              <Box>
                <Typography fontSize={"10px"}>ANDRIOD APP ON</Typography>
                <Typography variant="h6">Google Play</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: { md: "flex", sm: "flex", xs: "block" },
          width: "100%",
          mt: 5,
          mb: 5,
          borderTop: "1px solid lightGray",
          borderBottom: "1px solid lightGray",
          height: 100,
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: { md: "50%", sm: "100%", xs: "100%" },
            display: { md: "flex", sm: "flex", xs: "block" },
            gap: 2,
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: { lg: "20px", md: "20px", sm: "17px", xs: "auto" },
              fontWeight: 700,
            }}
          >
            Shop by Region
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              mt: 3,
              mb: 3,
            }}
          >
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Fflags%2Fuk-icon.jpg&w=32&q=30"
            />
          </Box>
        </Box>
        <Box
          sx={{
            width: { md: "50%", sm: "100%", xs: "100%" },
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {PAYMENT_CARD.map((e, i) => (
            <a key={i} href={e.href}>
              <Box
                component={"img"}
                src={e.icon}
                sx={{ cursor: "pointer", width: "45px", height: "45px" }}
              />
            </a>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: { md: "flex", sm: "flex", xs: "block" },
          justifyContent: "start",
          mt: { md: 0, sm: 0, xs: 15 },
          mb: { md: 2, sm: 3, xs: 0 },
          textAlign: "start",
        }}
      >
        <Typography
          sx={{
            fontSize: { md: "14px", sm: "12px", xs: "14px" },
            width: { md: "900px", sm: "100%", xs: "100%" },
            fontWeight: 300,
            textAlign: "start",
          }}
        >
          © 2025 DIYPersonalizatoin.com Limited, County Gates, Ashton Road,
          Bristol, BS3 2JH, UK Registered Office: Century House, Wakefield 41
          Industrial Estate, Wakefield WF2 0XG, UK
          <a href="#" style={{ textDecoration: "none", marginLeft: "5px" }}>
            Term and Condition
          </a>
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
