import { useState, type SyntheticEvent } from "react";
import MainLayout from "../../../layout/MainLayout";
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Divider,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { LogoutOutlined, NotificationsActiveOutlined, PersonOutline, ReceiptLongOutlined, StyleOutlined } from "@mui/icons-material";

type TabValue = 0 | 1 | 2 | 3 | 4;

function a11yProps(index: number) {
    return {
        id: `user-tab-${index}`,
        "aria-controls": `user-tabpanel-${index}`,
    };
}

function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`user-tabpanel-${index}`}
            aria-labelledby={`user-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
        </div>
    );
}

const UserProfile = () => {
    const theme = useTheme();
    const fullWidth = useMediaQuery(theme.breakpoints.up("xs"));
    const { signOut } = useAuth();
    const [value, setValue] = useState<TabValue>(0);

    const handleChange = async (_: SyntheticEvent, newValue: TabValue) => {
        if (newValue === 4) {
            // why: make Signout an action instead of navigating to a panel
            await signOut();
            setValue(0);
            return;
        }
        setValue(newValue);
    };

    return (
        <MainLayout>
            <Box sx={{ p: { xs: 1.5, md: 2 }, maxWidth: 1200, mx: "auto" }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant={fullWidth ? "fullWidth" : "scrollable"}
                    allowScrollButtonsMobile
                    aria-label="User profile tabs"
                >
                    <Tab
                        icon={<PersonOutline />}
                        iconPosition="start"
                        label="Profile"
                        {...a11yProps(0)}
                    />
                    <Tab
                        icon={<ReceiptLongOutlined />}
                        iconPosition="start"
                        label="Orders"
                        {...a11yProps(1)}
                    />
                    <Tab
                        icon={<StyleOutlined />}
                        iconPosition="start"
                        label="Draft Card"
                        {...a11yProps(2)}
                    />
                    <Tab
                        icon={<NotificationsActiveOutlined />}
                        iconPosition="start"
                        label="Reminders"
                        {...a11yProps(3)}
                    />
                    <Tab
                        icon={<LogoutOutlined />}
                        iconPosition="start"
                        label="Sign out"
                        {...a11yProps(4)}
                        sx={{
                            color: "error.main",
                            "&.Mui-selected": { color: "error.main" },
                        }}
                    />
                </Tabs>

                <Divider sx={{ my: 2 }} />

                <TabPanel value={value} index={0}>
                    <Typography variant="h6" gutterBottom>Profile</Typography>
                    <Typography variant="body2">User details and settings go here.</Typography>
                </TabPanel>

                <TabPanel value={value} index={1}>
                    <Typography variant="h6" gutterBottom>Orders</Typography>
                    <Typography variant="body2">Your order history appears here.</Typography>
                </TabPanel>

                <TabPanel value={value} index={2}>
                    <Typography variant="h6" gutterBottom>Draft Card</Typography>
                    <Typography variant="body2">Saved drafts and designs.</Typography>
                </TabPanel>

                <TabPanel value={value} index={3}>
                    <Typography variant="h6" gutterBottom>Reminders</Typography>
                    <Typography variant="body2">Your reminders list.</Typography>
                </TabPanel>
            </Box>
        </MainLayout>
    );
};

export default UserProfile;
