import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";

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
}: { data: MegaMenuItem; onSelect: () => void }) => (
  <Box
    sx={{
      position: "absolute",
      top: "100%",
      left: 0,
      width: "100%",
      bgcolor: "white",
      height: 400,
      boxShadow: 3,
      zIndex: 10,
      p: 4,
      display: "flex",
      gap: 5,
      borderTop: "1px solid #ddd",
    }}
  >
    <Box sx={{display:'flex',gap:'60px',width:'100%'}}>
    {data.categories.map((category, index: number) => (
      <Box key={index}>
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
              <ListItemText primary={link} sx={{fontSize:'12px',color:'#212121',"&:hover":{textDecoration:'underline',bgcolor:'transparent'}}} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    ))}
  </Box>
  </Box>
);


export default MegaMenu