import { useEffect, useState } from 'react';
import TableList from '../../../components/TableList/TableList'
import DashboardLayout from '../../../layout/DashboardLayout'
import { fetchAllOrders } from '../../../source/source';

const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const result = await fetchAllOrders();

                const formatted: any = result.map((item) => ({
                    id: item.id,
                    sessionId: item.session_id.slice(0, 20),
                    name: item.user_name,
                    email: item.user_email,
                    date: new Date(item.created_at).toLocaleString(),
                    cardSize: item.card_size,
                    paymentStatus: item.status === "paid" ? "Paid" : "Pending",
                    orderStatus: "Completed",
                    total: "£" + item.amount,
                }));

                setOrders(formatted);
            } catch (err) {
                console.error(err);
            }
        };

        loadOrders();
    }, []);

    console.log(orders, '--0-0')

    return (
        <DashboardLayout title='Orders' exportBtn='Export File'>
            <TableList
                data={orders}
                heading={[
                    "Orders Id",
                    "Name",
                    'Email',
                    "Payment Status",
                    "Date & Time",
                    "Order Status",
                    "Total",
                ]}
            />
        </DashboardLayout>
    )
}

export default Orders