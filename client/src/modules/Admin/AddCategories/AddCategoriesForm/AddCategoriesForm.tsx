import { Box } from '@mui/material'
import CustomInput from '../../../../components/CustomInput/CustomInput'
import { useLocation } from 'react-router-dom';

const AddCategoriesForm = () => {
  const location = useLocation();
  const { categories } =
    (location.state as { categories?: any }) || {};

  const subCategories = categories?.subcategories.map((e: any) => e)
  return (
    <Box sx={{ width: '100%', display: 'flex', gap: 1, height: '100vh' }}>
      {/* Left Side */}
      <Box sx={{ width: '100%', bgcolor: 'red', height: '100%', boxShadow: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          component={'img'}
          src={categories.image_base64}
          sx={{ Width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      {/* Right Side */}
      <Box sx={{ width: '100%', height: '100%', boxShadow: 4, borderRadius: 2, p: 2 }}>
        <CustomInput
          label='Category'
          placeholder='Your Category'
          defaultValue={categories.name || ''}
        />

        {/* <CustomInput
          label='Items'
          placeholder='Items'
          defaultValue={`${categories.items} Items` || "10"}

        /> */}

        <CustomInput
          label='Sub Category'
          placeholder='Your Category'
          multiline
          defaultValue={subCategories || ''}
        />
      </Box>

    </Box>
  )
}

export default AddCategoriesForm