// // src/components/profile/tabs/OrdersTab.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   Badge,
//   Box,
//   Card,
//   CardContent,
//   Chip,
//   CircularProgress,
//   Divider,
//   Stack,
//   Tab,
//   Tabs,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   Typography,
//   useMediaQuery,
//   useTheme,
// } from "@mui/material";

// type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded";

// type Order = {
//   id: string;
//   createdAt: string; // ISO string
//   status: OrderStatus;
//   total?: number | null;
//   currency?: string | null; // e.g. "PKR"
//   itemsCount?: number | null;
// };

// type ApiErrorShape = { message?: string };

// async function safeJson<T>(res: Response): Promise<T | null> {
//   try {
//     return (await res.json()) as T;
//   } catch {
//     return null;
//   }
// }

// function getErrorMessage(err: unknown): string {
//   if (err instanceof Error) return err.message;
//   return "Something went wrong";
// }

// function formatDateTime(iso: string): string {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return iso;

//   return new Intl.DateTimeFormat("en-PK", {
//     dateStyle: "medium",
//     timeStyle: "short",
//     timeZone: "Asia/Karachi",
//   }).format(d);
// }

// function statusChipProps(status: OrderStatus): { label: string; color: "default" | "warning" | "info" | "success" | "error" } {
//   switch (status) {
//     case "pending":
//       return { label: "Pending", color: "warning" };
//     case "processing":
//       return { label: "Processing", color: "info" };
//     case "completed":
//       return { label: "Completed", color: "success" };
//     case "cancelled":
//       return { label: "Cancelled", color: "error" };
//     case "refunded":
//       return { label: "Refunded", color: "default" };
//     default:
//       return { label: status, color: "default" };
//   }
// }

// async function fetchMyOrders(signal?: AbortSignal): Promise<Order[]> {
//   // ✅ Adjust endpoint as per your backend
//   const res = await fetch("/api/orders/me", { signal });

//   if (!res.ok) {
//     const data = await safeJson<ApiErrorShape>(res);
//     throw new Error(data?.message ?? "Failed to load orders");
//   }

//   const data = (await res.json()) as unknown;

//   // ✅ If your API returns {orders:[...]} change this accordingly
//   if (Array.isArray(data)) return data as Order[];
//   if (data && typeof data === "object" && Array.isArray((data as any).orders)) return (data as any).orders as Order[];

//   throw new Error("Unexpected orders response shape");
// }

// type OrdersTabKey = "all" | OrderStatus;

// const TAB_DEFS: Array<{ key: OrdersTabKey; label: string; statuses?: OrderStatus[] }> = [
//   { key: "all", label: "All" },
//   { key: "pending", label: "Pending", statuses: ["pending"] },
//   { key: "processing", label: "Processing", statuses: ["processing"] },
//   { key: "completed", label: "Completed", statuses: ["completed"] },
//   { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
// ];

// const OrdersTab: React.FC = () => {
//   const theme = useTheme();
//   const isUpMd = useMediaQuery(theme.breakpoints.up("md"));

//   const [tab, setTab] = useState<OrdersTabKey>("all");
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const ac = new AbortController();

//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const list = await fetchMyOrders(ac.signal);
//         // newest first
//         list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//         setOrders(list);
//       } catch (e) {
//         setError(getErrorMessage(e));
//       } finally {
//         setLoading(false);
//       }
//     })();

//     return () => ac.abort();
//   }, []);

//   const counts = useMemo(() => {
//     const map: Record<string, number> = {};
//     for (const def of TAB_DEFS) {
//       if (def.key === "all") {
//         map[def.key] = orders.length;
//       } else {
//         map[def.key] = orders.filter((o) => o.status === def.key).length;
//       }
//     }
//     return map;
//   }, [orders]);

//   const filteredOrders = useMemo(() => {
//     if (tab === "all") return orders;
//     return orders.filter((o) => o.status === tab);
//   }, [orders, tab]);

//   return (
//     <Box sx={{ width: "100%" }}>
//       <Tabs
//         value={tab}
//         onChange={(_, v: OrdersTabKey) => setTab(v)}
//         variant="scrollable"
//         allowScrollButtonsMobile
//         scrollButtons="auto"
//         sx={{
//           border: "1px solid",
//           borderColor: "divider",
//           borderRadius: 2,
//           p: 0.5,
//           minHeight: 44,
//           bgcolor: "background.paper",
//           "& .MuiTabs-indicator": { display: "none" },
//           "& .MuiTabs-flexContainer": { gap: 0.5 },
//           "& .MuiTab-root": {
//             minHeight: 36,
//             py: 0.5,
//             px: 1.25,
//             borderRadius: 1.5,
//             textTransform: "none",
//             fontSize: 13,
//             fontWeight: 700,
//             color: "text.secondary",
//             "&.Mui-selected": {
//               bgcolor: "action.selected",
//               color: "text.primary",
//             },
//           },
//         }}
//       >
//         {TAB_DEFS.map((t) => (
//           <Tab
//             key={t.key}
//             value={t.key}
//             label={
//               <Badge
//                 badgeContent={counts[t.key] ?? 0}
//                 color="default"
//                 sx={{
//                   "& .MuiBadge-badge": {
//                     fontSize: 11,
//                     height: 18,
//                     minWidth: 18,
//                     borderRadius: 999,
//                   },
//                 }}
//               >
//                 <Box component="span" sx={{ pr: 1 }}>
//                   {t.label}
//                 </Box>
//               </Badge>
//             }
//           />
//         ))}
//       </Tabs>

//       <Box sx={{ mt: 2 }}>
//         {loading && (
//           <Box sx={{ display: "grid", placeItems: "center", minHeight: 220 }}>
//             <CircularProgress />
//           </Box>
//         )}

//         {!loading && error && <Alert severity="error">{error}</Alert>}

//         {!loading && !error && filteredOrders.length === 0 && (
//           <Box
//             sx={{
//               border: "1px dashed",
//               borderColor: "divider",
//               borderRadius: 2,
//               p: 2,
//               textAlign: "center",
//               color: "text.secondary",
//             }}
//           >
//             No orders found.
//           </Box>
//         )}

//         {!loading && !error && filteredOrders.length > 0 && (
//           <>
//             {isUpMd ? (
//               <Box
//                 sx={{
//                   border: "1px solid",
//                   borderColor: "divider",
//                   borderRadius: 2,
//                   overflow: "hidden",
//                   bgcolor: "background.paper",
//                 }}
//               >
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell sx={{ fontWeight: 800 }}>Order</TableCell>
//                       <TableCell sx={{ fontWeight: 800 }}>Date & time</TableCell>
//                       <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
//                       <TableCell sx={{ fontWeight: 800 }} align="right">
//                         Total
//                       </TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {filteredOrders.map((o) => {
//                       const chip = statusChipProps(o.status);
//                       const totalText =
//                         typeof o.total === "number"
//                           ? `${o.currency ?? "PKR"} ${o.total.toFixed(0)}`
//                           : "—";

//                       return (
//                         <TableRow key={o.id} hover>
//                           <TableCell>
//                             <Typography sx={{ fontWeight: 800 }}>{o.id}</Typography>
//                             <Typography variant="caption" color="text.secondary">
//                               Items: {o.itemsCount ?? "—"}
//                             </Typography>
//                           </TableCell>

//                           <TableCell>{formatDateTime(o.createdAt)}</TableCell>

//                           <TableCell>
//                             <Chip size="small" label={chip.label} color={chip.color} />
//                           </TableCell>

//                           <TableCell align="right">{totalText}</TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </Box>
//             ) : (
//               <Stack spacing={1.25}>
//                 {filteredOrders.map((o) => {
//                   const chip = statusChipProps(o.status);
//                   const totalText =
//                     typeof o.total === "number"
//                       ? `${o.currency ?? "PKR"} ${o.total.toFixed(0)}`
//                       : "—";

//                   return (
//                     <Card key={o.id} variant="outlined" sx={{ borderRadius: 2 }}>
//                       <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
//                         <Stack spacing={0.75}>
//                           <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
//                             <Typography sx={{ fontWeight: 900 }} noWrap>
//                               {o.id}
//                             </Typography>
//                             <Chip size="small" label={chip.label} color={chip.color} />
//                           </Stack>

//                           <Divider />

//                           <Stack direction="row" justifyContent="space-between">
//                             <Typography variant="body2" color="text.secondary">
//                               Date
//                             </Typography>
//                             <Typography variant="body2">{formatDateTime(o.createdAt)}</Typography>
//                           </Stack>

//                           <Stack direction="row" justifyContent="space-between">
//                             <Typography variant="body2" color="text.secondary">
//                               Items
//                             </Typography>
//                             <Typography variant="body2">{o.itemsCount ?? "—"}</Typography>
//                           </Stack>

//                           <Stack direction="row" justifyContent="space-between">
//                             <Typography variant="body2" color="text.secondary">
//                               Total
//                             </Typography>
//                             <Typography variant="body2" sx={{ fontWeight: 800 }}>
//                               {totalText}
//                             </Typography>
//                           </Stack>
//                         </Stack>
//                       </CardContent>
//                     </Card>
//                   );
//                 })}
//               </Stack>
//             )}
//           </>
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default OrdersTab;


import React from 'react'

const OrdersTab = () => {
  return (
    <div>OrdersTab</div>
  )
}

export default OrdersTab