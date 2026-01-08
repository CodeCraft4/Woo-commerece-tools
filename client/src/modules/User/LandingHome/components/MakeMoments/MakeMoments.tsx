import { Box, Typography } from '@mui/material'
import { COLORS } from '../../../../../constant/color'


const data = [
    'Birthday',
    'Wedding',
    'New Baby',
    'Christmas',
    'Mother Day',
    'Engagement',
    'Anniversary',
    'New Job',
    'Valentine',
    'Father Day',
]

const MakeMoments = () => {
    return (
        <Box>
            <Typography sx={{ fontSize: { md: 35, sm: 30, xs: 20 }, fontWeight: 600, color: COLORS.primary, lineHeight: 1.3, textAlign: 'center' }}>Make Moment you way.</Typography>
            <Typography sx={{ fontSize: { md: 30, sm: 25, xs: 'auto' } }}>Shop by Occasion and create something truly meaningful.</Typography>

            <Box sx={{ width: '100%', p: 3, bgcolor: COLORS.primary, alignItems: 'center', display: 'flex', textAlign: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mt: 3, borderRadius: 3, height: { md: 200, sm: 200, xs: 'auto' } }}>
                {data.map((e,i) => (
                    <Typography key={i} sx={{ fontSize: { md: 25, sm: 25, xs: 20 }, width: 220, cursor: 'pointer' }}>{e}</Typography>
                ))}
            </Box>
        </Box>
    )
}

export default MakeMoments