import { Box, List, ListItem, Typography } from "@mui/material";
import { COLORS } from "../../../constant/color";
import { Apple } from "@mui/icons-material";
import { FooterLinks } from "../../../constant/data";

const Footer = () => {
  return (
    <Box
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
          <Box>
            <Typography sx={{ fontSize: "22px", fontWeight: 800 }}>
              {e.title}
            </Typography>
            <List>
              {e.links.map((link) => (
                <ListItem
                  sx={{ fontSize: "20px", mb: 1, textAlign: "start", px: 0 }}
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
          <Typography sx={{ fontSize: "25px", fontWeight: 800 }}>
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
              sx={{width:'50px',height:'50px'}}
            />
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Ftiktok.jpg&w=96&q=75"
              sx={{width:'50px',height:'50px'}}
            />
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Finstagram.jpg&w=96&q=75"
              sx={{width:'50px',height:'50px'}}
            />
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fyoutube.jpg&w=96&q=75"
              sx={{width:'50px',height:'50px'}}
            />
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fblog-disc.jpg&w=96&q=75"
              sx={{width:'50px',height:'50px'}}
            />
          </Box>
        </Box>
        <Box sx={{ width: { md: "50%", sm: "", xs: "100%" } }}>
          <Typography sx={{ fontSize: "25px", fontWeight: 800 }}>
            Download the App
          </Typography>

          <Box
            sx={{
              display: { md: "flex", sm: "", xs: "block" },
              mt: 5,
              width: { md: "65%", sm: "", xs: "100%" },
            }}
          >
            <Box
              sx={{
                height: "60px",
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
                <Typography fontSize={"12px"}>Download on the</Typography>
                <Typography variant="h6">App Store</Typography>
              </Box>
            </Box>
            <Box
              sx={{
                height: "60px",
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
              <Apple fontSize="large" />
              <Box>
                <Typography fontSize={"12px"}>ANDRIOD APP ON</Typography>
                <Typography variant="h5">Google Play</Typography>
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
          <Typography sx={{ fontSize: "25px", fontWeight: 800 }}>
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
            <Box
              component={"img"}
              src="https://www.funkypigeon.com/_next/image?url=%2Fimages%2Fflags%2Fireland.jpg&w=32&q=30"
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
            sx={{ cursor: "pointer", width: "60px", height: "50px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fmaestro.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "60px", height: "50px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fvisa.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "60px", height: "50px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Famerican-express.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "60px", height: "50px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fapple-pay.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "60px", height: "50px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fpaypal.jpg&w=48&q=75"
            }
            sx={{ cursor: "pointer", width: "60px", height: "50px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fclearpay.png&w=96&q=75"
            }
            sx={{ cursor: "pointer", width: "60px", height: "50px" }}
          />
          <Box
            component={"img"}
            src={
              "https://www.funkypigeon.com/_next/image?url=%2Fimages%2Ffooter%2Fklarna.png&w=96&q=75"
            }
            sx={{ cursor: "pointer", width: "60px", height: "50px" }}
          />
        </Box>
      </Box>


      <Typography
        sx={{
          fontSize: { md: "20px", sm: "", xs: "14px" },
          width: { md: "600px", sm: "", xs: "100%" },
        }}
      >
        © 2025 funkypigeon.com Limited, County Gates, Ashton Road, Bristol, BS3
        2JH, UK Registered Office: Century House, Wakefield 41 Industrial
        Estate, Wakefield WF2 0XG, UK <br />{" "}
        <a href="#" style={{ textDecoration: "none" }}>
          Term and Condition
        </a>
      </Typography>
    </Box>
  );
};

export default Footer;
