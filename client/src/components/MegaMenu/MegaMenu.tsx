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

const splitFooters = (links: string[] = []) => {
  const footers = links.filter((l) => /shop all/i.test(l) || /all .*$/i.test(l));
  const items = links.filter((l) => !footers.includes(l));
  return { items, footers };
};

const distributeIntoThree = <T,>(arr: T[]) => {
  const cols: [T[], T[], T[]] = [[], [], []];
  arr.forEach((item, i) => cols[i % 3].push(item));
  return cols;
};

const MegaMenu = ({
  data,
  onSelect,
}: {
  data: MegaMenuItem;
  onSelect?: (payload: { parent: string; label: string }) => void;
}) => {
  const columns = useMemo(() => {
    const cats = data?.categories ?? [];
    return cats.map((col) => {
      const { items, footers } = splitFooters(col.links ?? []);
      return { ...col, items, footers };
    });
  }, [data]);

  const [activeIdx, setActiveIdx] = useState(0);

  // why: keep active index valid when data changes
  React.useEffect(() => {
    if (activeIdx >= columns.length) setActiveIdx(0);
  }, [columns.length, activeIdx]);

  const active = columns[activeIdx];

  // 3 columns of names (balanced)
  const [colA, colB, colC] = useMemo(
    () => distributeIntoThree(columns),
    [columns]
  );

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
          p: 3,
          boxShadow: 3,
          position: "absolute",
          top: 0,
          minHeight: 240,
          maxHeight: 480,
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
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr", // stack on mobile
            sm: "1fr", // stack on small
            md: "repeat(3, minmax(0, 1fr)) minmax(0, 1.5fr)", // 3 name cols + 1 list col
          },
        }}
      >
        {/* Column 1 — category names */}
        <Box role="list" aria-label="Categories column 1">
          {colA.map((category, idx) => {
            const realIdx = columns.indexOf(category);
            const isActive = realIdx === activeIdx;
            return (
              <Typography
                key={`cat-a-${category.name}-${idx}`}
                variant="subtitle1"
                onMouseEnter={() => setActiveIdx(realIdx)}
                onFocus={() => setActiveIdx(realIdx)}
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

        {/* Column 2 — category names */}
        <Box role="list" aria-label="Categories column 2">
          {colB.map((category, idx) => {
            const realIdx = columns.indexOf(category);
            const isActive = realIdx === activeIdx;
            return (
              <Typography
                key={`cat-b-${category.name}-${idx}`}
                variant="subtitle1"
                onMouseEnter={() => setActiveIdx(realIdx)}
                onFocus={() => setActiveIdx(realIdx)}
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

        {/* Column 3 — category names */}
        <Box role="list" aria-label="Categories column 3">
          {colC.map((category, idx) => {
            const realIdx = columns.indexOf(category);
            const isActive = realIdx === activeIdx;
            return (
              <Typography
                key={`cat-c-${category.name}-${idx}`}
                variant="subtitle1"
                onMouseEnter={() => setActiveIdx(realIdx)}
                onFocus={() => setActiveIdx(realIdx)}
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

        {/* Column 4 — active category links */}
        <Box>
          {active ? (
            <List
              dense
              disablePadding
              sx={{
                p: 0,
                m: 0,
                overflow: "auto",
                maxHeight: 360,
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
                  onClick={() => onSelect?.({ parent: data.title, label: link })}
                >
                  <ListItemText
                    primary={link}
                    primaryTypographyProps={{ fontSize: 14, color: "#212121" }}
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
                <Box sx={{ pt: 0.75 }}>
                  {active.footers.map((link, i) => (
                    <ListItemButton
                      key={`footer-${active.name}-${link}-${i}`}
                      sx={{
                        py: 0.25,
                        px: 0,
                        "&:hover": { bgcolor: "transparent" },
                      }}
                      disableRipple
                      onClick={() => onSelect?.({ parent: data.title, label: link })}
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
