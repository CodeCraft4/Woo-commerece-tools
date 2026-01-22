import { Modal, Box, Typography, IconButton, Chip, Stack, Divider } from "@mui/material";
import { Close } from "@mui/icons-material";
import { COLORS } from "../../../../../constant/color";

type Props = {
    open: boolean;
    onClose: () => void;
    user: any;
};

// ✅ SAFE avatar resolver (null safe + priority)
const getAvatar = (u: any): string => {
    if (!u) return "/assets/images/user.png";

    const fromProfileUrl = u.profileUrl;

    const fromAvatarCols =
        u.avatar_url || u.photo_url || u.image || u.image_base64;

    const metaAvatar =
        u?.user_metadata?.avatar_url ||
        u?.user_metadata?.picture ||
        u?.identity_data?.avatar_url ||
        u?.identity_data?.picture ||
        u?.raw_user_meta_data?.avatar_url ||
        u?.raw_user_meta_data?.picture;

    return fromProfileUrl || fromAvatarCols || metaAvatar || "/assets/images/user.png";
};

const getName = (u: any) =>
    u?.name || u?.full_name || u?.display_name || u?.email || "Unknown User";

const getProvider = (u: any) => (u?.provider || u?.auth_provider || "").toLowerCase();

const getCreatedDate = (u: any) =>
    new Date(u?.created_at || u?.createdAt || Date.now()).toLocaleString();

function formatExpiry(expiresAt: string | null | undefined): string {
    if (!expiresAt) return "—";
    const d = new Date(expiresAt);
    if (!Number.isFinite(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ✅ premium active checker
function premiumActive(u: any) {
    if (!u?.isPremium) return false;
    if (!u?.premium_expires_at) return true;
    const t = new Date(u.premium_expires_at).getTime();
    if (!Number.isFinite(t)) return Boolean(u.isPremium);
    return t > Date.now();
}

const CustomerModal = ({ open, onClose, user }: Props) => {
    const provider = getProvider(user);
    const isPro = premiumActive(user);

    const expiryText = formatExpiry(user?.premium_expires_at);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800 }}>Customer</Typography>
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
                                position: "relative",
                                overflow: "visible", // ✅ allow crown outside
                                border: "3px solid #1d61a0ff",
                                boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                                bgcolor: "#f6f6f6",
                            }}
                        >
                            {/* ✅ Premium crown icon on avatar */}
                            {isPro ? (
                                <Box
                                    component="img"
                                    src="/assets/icons/premiumuser.png" // 👈 crown image
                                    alt="premium crown"
                                    sx={{
                                        position: "absolute",
                                        top: -34,
                                        left: "50%",
                                        transform: "translateX(-50%) rotate(-8deg)",
                                        width: 70,
                                        height: 70,
                                        objectFit: "contain",
                                        zIndex: 5,
                                        pointerEvents: "none",
                                        filter: "drop-shadow(0px 8px 8px rgba(0,0,0,0.25))",
                                    }}
                                />
                            ) : null}

                            <Box
                                component="img"
                                src={getAvatar(user)}
                                alt="avatar"
                                onError={(e: any) => {
                                    e.currentTarget.src = "/assets/images/user.png";
                                }}
                                sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                            />
                        </Box>
                    </Box>

                    {/* Right: details */}
                    <Box sx={{ flex: 1, minWidth: 350 }}>
                        <Typography sx={{ fontSize: 22, fontWeight: 900, mb: 0.5 }}>{getName(user)}</Typography>
                        {user?.email ? (
                            <Typography sx={{ color: "text.secondary", mb: 1.5 }}>{user.email}</Typography>
                        ) : null}

                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                            <Chip label={`Joined: ${getCreatedDate(user)}`} />
                            {provider ? (
                                <Chip
                                    label={`Provider: ${provider}`}
                                    color={provider === "google" ? "success" : "default"}
                                />
                            ) : null}

                        </Stack>

                        <Divider sx={{ my: 1.5 }} />

                        {/* ✅ Premium info section */}
                        <Box sx={{ mt: 1 }}>
                            <Typography sx={{ fontWeight: 900, mb: 1 }}>Subscription Info</Typography>

                            <Stack spacing={1}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                                    <Typography sx={{ color: "text.secondary" }}>Expiry Date</Typography>
                                    <Typography >{expiryText}</Typography>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center" }}>
                                    <Typography sx={{ color: "text.secondary" }}>Session ID</Typography>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, maxWidth: 280 }}>
                                        <Typography
                                            sx={{
                                                fontFamily: "monospace",
                                                fontSize: 12,
                                                fontWeight: 800,
                                                wordBreak: "break-all",
                                                textAlign: "right",
                                            }}
                                        >
                                            {user.stripe_customer_id || "—"}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center" }}>
                                    <Typography sx={{ color: "text.secondary" }}>Subscription ID</Typography>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, maxWidth: 280 }}>
                                        <Typography
                                            sx={{
                                                fontFamily: "monospace",
                                                fontSize: 12,
                                                fontWeight: 800,
                                                wordBreak: "break-all",
                                                textAlign: "right",
                                            }}
                                        >
                                            {user.stripe_subscription_id || "—"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>
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
    width: { md: 650, sm: 520, xs: "95%" },
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "12px",
    p: 2,
};
