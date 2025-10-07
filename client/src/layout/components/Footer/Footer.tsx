import { Box, List, ListItem, Typography } from "@mui/material";
import { COLORS } from "../../../constant/color";
import { Apple } from "@mui/icons-material";
import { FooterLinks } from "../../../constant/data";

const Footer = () => {
  return (
    <Box>
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
          <Box key={e.title} p={{md:0,sm:0,xs:2}}>
            <Typography sx={{ fontSize: "20px", fontWeight: 800 }}>
              {e.title}
            </Typography>
            <List>
              {e.links.map((link) => (
                <ListItem
                  key={link.name}
                  sx={{
                    fontSize: {md:"18px",sm:"18px",xs:'14px'},
                    mb: {md:1.5,sm:1.5,xs:'auto'},
                    textAlign: "start",
                    px: 0,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  <a
                    href={link.path}
                    style={{ textDecoration: "none", color: COLORS.primary }}
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
        <Box sx={{ width: { md: "50%", sm: "", xs: "100%" } }}>
          <Typography sx={{ fontSize: "20px", fontWeight: 800 }}>
            Let's get Social
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              flexWrap: "wrap",
              mt: 3,
              mb: 3,
            }}
          >
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Ffacebook.jpg&w=96&q=75"
              sx={{ width: "50px", height: "50px" }}
            />
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Ftiktok.jpg&w=96&q=75"
              sx={{ width: "50px", height: "50px" }}
            />
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Finstagram.jpg&w=96&q=75"
              sx={{ width: "50px", height: "50px" }}
            />
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fyoutube.jpg&w=96&q=75"
              sx={{ width: "50px", height: "50px" }}
            />
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fblog-disc.jpg&w=96&q=75"
              sx={{ width: "50px", height: "50px" }}
            />
          </Box>
        </Box>
        <Box sx={{ width: { md: "50%", sm: "", xs: "100%" } }}>
          <Typography sx={{ fontSize: "20px", fontWeight: 800 }}>
            Download the App
          </Typography>

          <Box
            sx={{
              display: { md: "flex", sm: "", xs: "block" },
              mt: 3,
              width: { md: "70%", sm: "", xs: "100%" },
            }}
          >
            <Box
              sx={{
                height: "50px",
                borderRadius: 4,
                bgcolor: COLORS.primary,
                color: COLORS.white,
                px: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                m: "auto",
                gap: 2,
                mb: { md: 0, sm: 0, xs: 2 },
              }}
            >
              <Apple fontSize="large" />
              <Box>
                <Typography fontSize={"10px"}>Download on the</Typography>
                <Typography variant="h6">App Store</Typography>
              </Box>
            </Box>
            <Box
              sx={{
                height: "50px",
                borderRadius: 4,
                bgcolor: COLORS.primary,
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
                src="/assets/icons/playstore.png"
                sx={{ width: 40 }}
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
          display: { md: "flex", sm: "", xs: "block" },
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
            width: { md: "50%", sm: "", xs: "100%" },
            display: { md: "flex", sm: "", xs: "block" },
            gap: 2,
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: 700 }}>
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
            width: { md: "50%", sm: "", xs: "100%" },
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fmastercard.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "45px", height: "30px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fmaestro.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "45px", height: "30px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fvisa.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "45px", height: "30px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Famerican-express.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "45px", height: "30px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fapple-pay.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "45px", height: "30px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fpaypal.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "45px", height: "30px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fclearpay.png&w=96&q=75"
            }
            sx={{ cursor: "pointer", width: "45px", height: "30px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fklarna.png&w=96&q=75"
            }
            sx={{ cursor: "pointer", width: "45px", height: "30px" }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          m: "auto",
          mb: { md: 3, sm: 3, xs: 8 },
        }}
      >
        <Typography
          sx={{
            fontSize: { md: "14px", sm: "", xs: "14px" },
            width: { md: "900px", sm: "", xs: "100%" },
            fontWeight: 300,
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
