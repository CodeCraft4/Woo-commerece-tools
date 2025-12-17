// import {
//   Box,
//   List,
//   ListItemButton,
//   ListItemText,
//   Typography,
// } from "@mui/material";
// import { COLORS } from "../../constant/color";
// import { useMemo } from "react";

// interface Category {
//   name: string;
//   links: string[];
// }

// interface MegaMenuItem {
//   /** Main category title (e.g., "Birthday") */
//   title: string;
//   /** Columns */
//   categories: Category[];
// }

// const MegaMenu = ({
//   data,
//   onSelect,
// }: {
//   data: MegaMenuItem;
//   onSelect: () => void;
// }) => {
//   const columns = useMemo(() => {
//     return (data?.categories ?? []).map((col) => {
//       const footers = col.links.filter(
//         (l) => /shop all/i.test(l) || /all .*$/i.test(l)
//       );
//       const items = col.links.filter((l) => !footers.includes(l));
//       return { ...col, items, footers };
//     });
//   }, [data]);

//   return (
//     <Box
//       sx={{
//         position: "absolute",
//         top: "80%",
//         left: 0,
//         width: "100%",
//         zIndex: 10,
//         display: "flex",
//         justifyContent: "center",
//         pointerEvents: "auto",
//       }}
//     >
//       <Box
//         sx={{
//           width: { lg: 1660, md: "100%", sm: "100%", xs: "100%" },
//           bgcolor: "#fff",
//           display: "flex",
//           p: 3,
//           boxShadow: 3,
//           position: "absolute",
//           top: 0,
//           minHeight: 340,
//           maxHeight: 400,
//           overflowY: 'auto',
//           "&::-webkit-scrollbar": {
//             height: "6px",
//             width: 6
//           },
//           "&::-webkit-scrollbar-track": {
//             backgroundColor: "#f1f1f1",
//             borderRadius: "20px",
//           },
//           "&::-webkit-scrollbar-thumb": {
//             backgroundColor: COLORS.primary,
//             borderRadius: "20px",
//           },
//         }}
//       >
//         {/* LEFT — Moonpig-like grid of columns */}
//         <Box
//           sx={{
//             width: "100%",
//             pr: 3,
//             // overflow: "hidden",
//             display: "grid",
//             gridTemplateColumns: {
//               lg: "repeat(5, minmax(180px, 1fr))",
//               md: "repeat(3, minmax(180px, 1fr))",
//               sm: "repeat(2, minmax(180px, 1fr))",
//             },
//             gap: 3,
//           }}
//         >
//           {columns.map((category, index: number) => (
//             <Box key={`${category.name}-${index}`} sx={{ color: COLORS.black }}>
//               {/* Column header */}
//               <Typography
//                 variant="subtitle1"
//                 sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: COLORS.seconday }}
//               >
//                 {category.name}
//               </Typography>

//               {/* Links list */}
//               <List
//                 dense
//                 disablePadding
//                 sx={{
//                   p: 0,
//                   m: 0,
//                   overflow: "auto",
//                   maxHeight: 290,
//                   "&::-webkit-scrollbar": { width: 6 },
//                   "&::-webkit-scrollbar-thumb": {
//                     backgroundColor: "#ddd",
//                     borderRadius: 10,
//                   },
//                 }}
//               >
//                 {category.items.map((link, linkIndex: number) => (
//                   <ListItemButton
//                     key={`${link}-${linkIndex}`}
//                     sx={{
//                       py: 0.25,
//                       px: 0,
//                       "&:hover": { bgcolor: "transparent" },
//                     }}
//                     disableRipple
//                     onClick={onSelect}
//                   >
//                     <ListItemText
//                       primary={link}
//                       primaryTypographyProps={{
//                         fontSize: 14,
//                         color: "#212121",
//                       }}
//                       sx={{
//                         m: 0,
//                         "& .MuiListItemText-primary:hover": {
//                           textDecoration: "underline",
//                         },
//                       }}
//                     />
//                   </ListItemButton>
//                 ))}

//                 {/* “Shop all …” footer links, if any */}
//                 {category.footers.length > 0 && (
//                   <Box sx={{ pt: 0.75 }}>
//                     {category.footers.map((link, i) => (
//                       <ListItemButton
//                         key={`footer-${link}-${i}`}
//                         sx={{
//                           py: 0.25,
//                           px: 0,
//                           "&:hover": { bgcolor: "transparent" },
//                         }}
//                         disableRipple
//                         onClick={onSelect}
//                       >
//                         <ListItemText
//                           primary={link}
//                           primaryTypographyProps={{
//                             fontSize: 14,
//                             fontWeight: 600,
//                             color: COLORS.primary,
//                           }}
//                           sx={{
//                             m: 0,
//                             "& .MuiListItemText-primary:hover": {
//                               textDecoration: "underline",
//                             },
//                           }}
//                         />
//                       </ListItemButton>
//                     ))}
//                   </Box>
//                 )}
//               </List>
//             </Box>
//           ))}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default MegaMenu;


// File: src/components/MegaMenu/MegaMenu.tsx
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { COLORS } from "../../constant/color";
import React, { useMemo, useState } from "react";

interface Category {
  name: string;
  links: string[];
}

interface MegaMenuItem {
  title: string;
  categories: Category[];
}

const MegaMenu = ({
  data,
  onSelect,
}: {
  data: MegaMenuItem;
  onSelect: () => void;
}) => {
  const columns = useMemo(() => {
    const cats = data?.categories ?? [];
    return cats.map((col) => {
      const footers = (col.links ?? []).filter(
        (l) => /shop all/i.test(l) || /all .*$/i.test(l)
      );
      const items = (col.links ?? []).filter((l) => !footers.includes(l));
      return { ...col, items, footers };
    });
  }, [data]);

  const [activeIdx, setActiveIdx] = useState(0);

  // why: keep active index valid when data changes
  React.useEffect(() => {
    if (activeIdx >= columns.length) setActiveIdx(0);
  }, [columns.length, activeIdx]);

  const active = columns[activeIdx];

  return (
    <Box
      sx={{
        position: "absolute",
        top: "80%",
        left: 0,
        width: "100%",
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
      role="dialog"
      aria-label={data?.title ?? "Mega menu"}
    >
      <Box
        sx={{
          width: { lg: 1660, md: "100%", sm: "100%", xs: "100%" },
          bgcolor: "#fff",
          display: "flex",
          p: 3,
          boxShadow: 3,
          position: "absolute",
          top: 0,
          minHeight: 200,
          maxHeight: 400,
          overflowY: "auto",
          "&::-webkit-scrollbar": { height: "6px", width: 6 },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: COLORS.primary,
            borderRadius: "20px",
          },
          gap: 4,
        }}
      >
        {/* Left: Categories */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            width: "70%",
            justifyContent:'space-around',
            alignContent: "flex-start",
          }}
          role="list"
          aria-label="Categories"
        >
          {columns.map((category, idx) => {
            const isActive = idx === activeIdx;
            return (
              <Typography
                key={`cat-${category.name}-${idx}`}
                variant="subtitle1"
                onMouseEnter={() => setActiveIdx(idx)}
                onFocus={() => setActiveIdx(idx)}
                tabIndex={0}
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: isActive ? COLORS.primary : COLORS.seconday,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  textDecoration: isActive ? "underline" : "none",
                }}
                aria-current={isActive ? "true" : undefined}
              >
                {category.name}
              </Typography>
            );
          })}
        </Box>

        {/* Right: Subcategories for active category */}
        <Box sx={{ width: "30%" }}>
          {active ? (
            <List
              dense
              disablePadding
              sx={{
                p: 0,
                m: 0,
                overflow: "auto",
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                maxHeight: 290,
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ddd",
                  borderRadius: 10,
                },
              }}
              aria-label={`Subcategories of ${active.name}`}
            >
              {active.items.map((link, linkIndex: number) => (
                <ListItemButton
                  key={`item-${active.name}-${link}-${linkIndex}`}
                  sx={{
                    py: 0.25,
                    px: 0,
                    "&:hover": { bgcolor: "transparent" },
                  }}
                  disableRipple
                  onClick={onSelect}
                >
                  <ListItemText
                    primary={link}
                    primaryTypographyProps={{
                      fontSize: 14,
                      color: "#212121",
                    }}
                    sx={{
                      m: 0,
                      "& .MuiListItemText-primary:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  />
                </ListItemButton>
              ))}

              {active.footers.length > 0 && (
                <Box sx={{ pt: 0.75, width: "100%" }}>
                  {active.footers.map((link, i) => (
                    <ListItemButton
                      key={`footer-${active.name}-${link}-${i}`}
                      sx={{
                        py: 0.25,
                        px: 0,
                        "&:hover": { bgcolor: "transparent" },
                      }}
                      disableRipple
                      onClick={onSelect}
                    >
                      <ListItemText
                        primary={link}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: COLORS.primary,
                        }}
                        sx={{
                          m: 0,
                          "& .MuiListItemText-primary:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      />
                    </ListItemButton>
                  ))}
                </Box>
              )}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No subcategories
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MegaMenu;

