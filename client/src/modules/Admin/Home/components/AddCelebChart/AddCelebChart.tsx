import { Box, Card, Typography, Stack } from "@mui/material";
import AnimatedRingChart from "./AnimatedRingChart";
import PiChart from "./PiChart";

const AddCelebChart = () => {
  return (
    <Card
      sx={{
        p: 3,
        width:'40%',
        borderRadius: 4,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,165,0,0.1))",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          Total Cards Added{" "}
          <Typography component="span" variant="subtitle2" color="text.secondary">
            ( This month )
          </Typography>
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          14,33
        </Typography>
      </Stack>

      {/* Legend */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          bgcolor: "#fff",
          borderRadius: 2,
          p: 1.5,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          mb: 3,
        }}
      >
        {[
          { color: "#6C5DD3", label: "Active" },
          { color: "#F472B6", label: "Completed" },
          { color: "#0049C6", label: "Pending" },
        ].map((item) => (
          <Stack direction="row" alignItems="center" gap={1} key={item.label}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: item.color,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* Chart Area */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={{ width: "50%", display: "flex", justifyContent: "center" }}>
          <PiChart />
        </Box>

        <Stack spacing={5} sx={{ width: "50%" }}>
          <AnimatedRingChart
            percentage={18}
            label="Increasing weekly"
            color="#FF4081"
            bgcolor="#FFF0F6"
          />
          <AnimatedRingChart
            percentage={64}
            label="Increasing monthly"
            color="#0049C6"
            bgcolor="#E3F2FD"
          />
        </Stack>
      </Stack>
    </Card>
  );
};

export default AddCelebChart;
