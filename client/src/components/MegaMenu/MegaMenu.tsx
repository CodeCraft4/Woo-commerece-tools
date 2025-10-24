import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { COLORS } from "../../constant/color";

// Define the type for a single category
interface Category {
  name: string;
  links: string[];
}

// Define the type for a single mega menu item
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
}) => (
  <Box
    sx={{
      position: "absolute",
      top: "80%",
      left: 0,
      // width: {md:'1360px',sm:'',xs:'100%'},
      bgcolor: "transparent",
      width: "100%",
      zIndex: 10,
      display: "flex",
      justifyContent: "center",
      m: "auto",
    }}
  >
    <Box
      sx={{
        display: "flex",
        gap: "60px",
        width: { md: "1310px", sm: "", xs: "auto" },
        bgcolor: "white",
        p: 4,
        boxShadow: 3,
        position:'absolute' ,
        top:0,
        height: 400,
      }}
    >
      {data.categories.map((category, index: number) => (
        <Box key={index} sx={{ color: COLORS.primary }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
            {category.name}
          </Typography>
          <List sx={{ p: 0 }}>
            {category.links.map((link, linkIndex: number) => (
              <ListItemButton
                key={linkIndex}
                sx={{ py: 0, px: 0 }}
                onClick={onSelect}
              >
                <ListItemText
                  primary={link}
                  sx={{
                    fontSize: "12px",
                    color: "#212121",
                    "&:hover": {
                      textDecoration: "underline",
                      bgcolor: "transparent",
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  </Box>
);

export default MegaMenu;
