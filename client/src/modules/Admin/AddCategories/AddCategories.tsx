import { Box, Typography } from '@mui/material'
import DashboardLayout from '../../../layout/DashboardLayout'

const AddCategories = () => {
    return (
        <DashboardLayout title='Categories' addBtn='Save' exportBtn='Cancel'>
            <Box sx={{ display: 'flex', gap: 4, width: '100%', overflowY: 'auto', p: 2 }}>
                <Box sx={{ width: '70%', height: '700px', bgcolor: 'lightGray', boxShadow: 6, borderRadius: 1, p: 2 }}>
                    <Typography fontWeight={700}>Products <span style={{ fontWeight: 500, fontSize: 12 }}>12</span></Typography>

                    <Box sx={{ mt: 3, display: 'flex', gap: '20px', flexDirection: 'column', overflowY: 'auto', height: '100%' }}>
                        {[
                            1, 2, 3, 4, 5, 6, 7,
                        ].map((_) => (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px solid gray', borderRadius: 1, p: 1 }}>
                                <Box
                                    component={'img'}
                                    src='/assets/images/animated-banner.jpg'
                                    sx={{ width: 50, height: 50, borderRadius: 2, objectFit: 'cover' }} />
                                <Typography>Product Title</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box sx={{ width: '30%', height: '600px', bgcolor: 'lightGray', boxShadow: 6, borderRadius: 1 }}>afdfa</Box>
            </Box>
        </DashboardLayout>
    )
}

export default AddCategories