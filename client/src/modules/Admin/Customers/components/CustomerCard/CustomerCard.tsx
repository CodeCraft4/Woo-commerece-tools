import { Box, IconButton, Typography } from "@mui/material";
import { Visibility, Delete } from "@mui/icons-material";
import { COLORS } from "../../../../../constant/color";

type Props = {
    user: any;
    onView: () => void;
    onDelete: () => void;
};

// Robust avatar + name helpers
const getAvatar = (u: any) =>
    u.avatar_url || u.photo_url || u.image || u.image_base64 || "/assets/images/user.png";

const getName = (u: any) =>
    u.name || u.full_name || u.display_name || u.email || "Unknown User";

const getProvider = (u: any) => (u.provider || u.auth_provider || "").toLowerCase();

const getCreatedDate = (u: any) =>
    new Date(u.created_at || (u.createdAt as any) || Date.now()).toLocaleDateString();

const CustomerCard = ({ user, onView, onDelete }: Props) => {
    const provider = getProvider(user);

    return (
        <Box p={1} sx={{ width: { md: 250, sm: 280, xs: '98%' } }}>
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    height: { md: 280, sm: 280, xs: 250 },
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    bgcolor: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    "&:hover .overlay": { opacity: 1, transform: "translateY(0)" },
                    border: `1px solid ${COLORS.primary}`
                }}
            >
                {/* Rounded avatar */}
                <Box
                    sx={{
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        overflow: "hidden",
                        position: "absolute",
                        left: "50%",
                        top: 18,
                        transform: "translateX(-50%)",
                        border: "3px solid #fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                >
                    <Box
                        component="img"
                        src={getAvatar(user)}
                        alt="avatar"
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </Box>

                {/* Name / Email / Date */}
                <Box sx={{ position: "absolute", bottom: 14, width: "100%", textAlign: "center", px: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>
                        {getName(user)}
                    </Typography>
                    {user.email && (
                        <Typography sx={{ color: "text.secondary", fontSize: 13, mb: 0.3 }} noWrap>
                            {user.email}
                        </Typography>
                    )}
                    <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                        Joined: {getCreatedDate(user)} {provider === "google" ? "• Google" : ""}
                    </Typography>
                </Box>

                {/* Hover overlay actions */}
                <Box
                    className="overlay"
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1.5,
                        opacity: 0,
                        transform: "translateY(12px)",
                        transition: "all 0.25s ease",
                        bgcolor: "rgba(0,0,0,0.35)",
                    }}
                >
                    <IconButton
                        onClick={onView}
                        sx={{ bgcolor: COLORS.white, color: COLORS.primary, "&:hover": { bgcolor: "#f0f0f0" } }}
                    >
                        <Visibility />
                    </IconButton>
                    <IconButton
                        onClick={onDelete}
                        sx={{ bgcolor: "#fff", color: "red", "&:hover": { bgcolor: "#f0f0f0" } }}
                    >
                        <Delete />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default CustomerCard;
