// File: src/modules/Admin/Customers/components/CustomerModal/CustomerModal.tsx
import { Modal, Box, Typography, IconButton, Chip, Stack } from "@mui/material";
import { Close } from "@mui/icons-material";
import { COLORS } from "../../../../../constant/color";

type Props = {
    open: boolean;
    onClose: () => void;
    user: any;
};

const getAvatar = (u: any) =>
    u.avatar_url || u.photo_url || u.image || u.image_base64 || "/assets/images/user.png";

const getName = (u: any) =>
    u.name || u.full_name || u.display_name || u.email || "Unknown User";

const getProvider = (u: any) => (u.provider || u.auth_provider || "").toLowerCase();

const getCreatedDate = (u: any) =>
    new Date(u.created_at || (u.createdAt as any) || Date.now()).toLocaleString();

const CustomerModal = ({ open, onClose, user }: Props) => {
    const provider = getProvider(user);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Customer</Typography>
                    <IconButton onClick={onClose} sx={{ color: COLORS.black }}>
                        <Close />
                    </IconButton>
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                    {/* Left: large rounded avatar */}
                    <Box sx={{ width: { xs: "100%", sm: 260 }, display: "flex", justifyContent: "center" }}>
                        <Box
                            sx={{
                                width: 220,
                                height: 220,
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "3px solid #1d61a0ff",
                                boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                            }}
                        >
                            <Box
                                component="img"
                                src={getAvatar(user)}
                                alt="avatar"
                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </Box>
                    </Box>

                    {/* Right: details */}
                    <Box sx={{ flex: 1, minWidth: 260 }}>
                        <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 0.5 }}>{getName(user)}</Typography>
                        {user.email && (
                            <Typography sx={{ color: "text.secondary", mb: 1.5 }}>{user.email}</Typography>
                        )}

                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip label={`Joined: ${getCreatedDate(user)}`} />
                            {provider && <Chip label={`Provider: ${provider}`} color={provider === "google" ? "success" : "default"} />}
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default CustomerModal;

const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { md: 500, sm: 500, xs: "95%" },
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "12px",
    p: 2,
};
