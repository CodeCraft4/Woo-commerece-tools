import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import { COLORS } from "../../constant/color";
import { Close } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import LandingButton from "../LandingButton/LandingButton";

const RemindersDrawer = () => {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 450, p: 2 }} role="presentation">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
          Notification
        </Typography>

        {/* ✅ Close only on this button */}
        <IconButton onClick={toggleDrawer(false)}>
          <Close />
        </IconButton>
      </Box>

      <Divider />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",
          height: "60vh",
          textAlign: "center",
          mt: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
       <Box
       component={'img'}
       src="/assets/icons/reminder-calender.svg"
       sx={{
        width:130,
        height:130
       }}
       />

        <Typography sx={{ fontSize: "24px", fontWeight: 700, pb: 2 }}>
          80% of our customers have got a reminder.
        </Typography>
        <Typography>
          Set a reminder below and never forget an important occasion again –
          phew!
        </Typography>
        <Typography sx={{ fontSize: "20px", fontWeight: 700, pb: 2 }}>
          Get 20% off on the DIY Personalisation app now when you set 3
          reminders!
        </Typography>

        <LandingButton
          title="Set Reminders"
          width="400px"
          personal
          onClick={toggleDrawer(false)}
        />
        <LandingButton
          title="View All Reminders"
          width="400px"
          personal
          variant="outlined"
          onClick={toggleDrawer(false)}
        />
      </Box>
    </Box>
  );

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)} sx={iconStyle}>
        <Box
          component="img"
          src="/assets/icons/Reminders.svg"
          sx={{
            width: 35,
            height: 35,
          }}
        />
        <Typography fontSize="12px">Reminders</Typography>
      </IconButton>

      {/* ✅ Drawer closes only on outside click or Close button */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
};

export default RemindersDrawer;

const iconStyle = {
  color: COLORS.black,
  flexDirection: "column",
  "&:hover": {
    color: COLORS.primary,
    bgcolor: "transparent",
  },
};
