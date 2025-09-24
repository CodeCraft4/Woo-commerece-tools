import { Box, Button, CircularProgress } from "@mui/material";
import { COLORS } from "../../constant/color";

type ButtonTypes = {
  title: string;
  onClick?: () => void;
  width?: string;
  variant?: "text" | "outlined" | "contained";
  loading?: boolean;
  personal?: boolean;
};

const LandingButton = (props: ButtonTypes) => {
  const { title, personal, onClick, width, variant, loading } = props || {};

  return (
    <Box>
      <Button
        variant={variant ? variant : "contained"}
        onClick={onClick}
        disabled={loading}
        sx={{
          p: 1.3,
          bgcolor: variant ? "transparent" : "#abe8b0",
          borderRadius: personal ? 0 : '3px',
          fontWeight: 600,
          mb:{md:0,sm:0,xs:1},
          color:  COLORS.primary,
          textTransform: "none",
          px: 2,
          opacity: 0.8,
          height: {md:personal ? "50px" : "40px",sm:'',xs:'40px'},
          width:{md: width ? width : "auto",sm:'',xs:'100%'},
          border:variant ? `1px solid ${COLORS.primary}` :0
        }}
      >
        {loading ? (
          <CircularProgress
            size={20}
            sx={{ color: variant ? COLORS.primary : "#212121" }}
          />
        ) : (
          title
        )}
      </Button>
    </Box>
  );
};

export default LandingButton;
