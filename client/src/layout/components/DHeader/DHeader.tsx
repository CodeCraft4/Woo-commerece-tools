// DHeader.tsx
import { Box, Typography } from "@mui/material";
import LandingButton from "../../../components/LandingButton/LandingButton";

type Props = {
  title?: string;
  exportBtn?: string;
  addBtn?: string;
  onClick?: () => void;
  onExportClick?: () => void;
};

const DHeader = (props: Props) => {
  const { title, exportBtn, addBtn, onClick, onExportClick } = props;

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1.5, sm: 2 }, mb: 3 }}>
      <Typography sx={{ fontSize: { md: 35, sm: 27, xs: 20 } }}>{title}</Typography>

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", width: { xs: "100%", sm: "auto" }, flexWrap: "wrap" }}>
        {exportBtn && (
          <LandingButton
            variant="outlined"
            title={exportBtn}
            onClick={onExportClick}   // âœ… ADD THIS
            width="140px"
          />
        )}

        {addBtn && <LandingButton title={addBtn} onClick={onClick} width="140px" />}
      </Box>
    </Box>
  );
};

export default DHeader;

