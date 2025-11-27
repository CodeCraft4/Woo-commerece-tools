import DashboardLayout from '../../../layout/DashboardLayout'
import AddCategoriesForm from './AddCategoriesForm/AddCategoriesForm'

const AddCategories = () => {
    return (
        // <DashboardLayout title='Add Categories' addBtn='Save' exportBtn='Edit'>
        <DashboardLayout title='Add Categories'>
            <AddCategoriesForm />
        </DashboardLayout>
    )
}

export default AddCategories