import { Box, Card, Typography, Stack } from "@mui/material";
import PiChart from "./PiChart";
import { useEffect, useState } from "react";
import { fetchOrderCount } from "../../../../../source/source";

const AddCelebChart = () => {

  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const loadOrders = async () => {
      const count: any = await fetchOrderCount();
      setOrderCount(count);
    };
    loadOrders();
  }, []);

  return (
    <Card
      sx={{
        p: 2,
        width: { md: '49%', sm: '100%', xs: '100%' },
        borderRadius: 4,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(238, 202, 134, 0.6))",
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
          Orders
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {orderCount.toLocaleString()}
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
          boxShadow: 4,
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
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: 'center', m: 'auto' }}>
          <PiChart totalOrder={orderCount.toLocaleString()} />
        </Box>
      </Stack>
    </Card>
  );
};

export default AddCelebChart;
