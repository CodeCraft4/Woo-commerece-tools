import TableList from '../../../components/TableList/TableList'
import { DUMMY_ORDERS } from '../../../constant/data'
import DashboardLayout from '../../../layout/DashboardLayout'

const Orders = () => {
    return (
        <DashboardLayout title='Orders' exportBtn='Export File'>
            <TableList data={DUMMY_ORDERS} heading={['Orderss', 'Date', 'Cusotomers', 'Payment Status', 'Orders Status', 'Total']} />
        </DashboardLayout>
    )
}

export default Orders