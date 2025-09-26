import { Box, Typography } from '@mui/material'

const StickerLine = () => {
  return (
    <Box 
    sx={{
        p:{md:1.5,sm:3,xs:1},
        bgcolor:"#ff825e",
        textAlign:'center',
        display:'flex',
        justifyContent:'center',
        m:'auto'
    }}
    >
        <Typography sx={{fontSize:{md:'16px',sm:'20px',xs:'14px'},fontWeight:700}}>Make it personal! <span style={{fontWeight:400}}>🥳 Add stickers, photos & more</span></Typography>
    </Box>
  )
}

export default StickerLine