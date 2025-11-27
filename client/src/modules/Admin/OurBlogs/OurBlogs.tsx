import { Box, Typography, CircularProgress, IconButton } from "@mui/material";
import DashboardLayout from "../../../layout/DashboardLayout";
import useModal from "../../../hooks/useModal";
import BlogsModal from "./components/BlogModal/BlogModal";
import { deleteBlog, fetchAllBlogs } from "../../../source/source";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import { Delete, Edit } from "@mui/icons-material";
import toast from "react-hot-toast";

const OurBlogs = () => {
    const { open: isBlogModal, openModal: openBlogModal, closeModal: closeBlogModal } = useModal(); const {
        open: isDeleteModal,
        openModal: openDeleteModal,
        closeModal: closeDeleteModal
    } = useModal();

    const [selectedBlog, setSelectedBlog] = useState<any>(null);


    // -------- React Query Fetch Blogs --------
    const {
        data: blogs = [],
        isLoading,
        isError,
        refetch
    } = useQuery({
        queryKey: ["blogs"],
        queryFn: fetchAllBlogs,
        staleTime: 1000 * 60 * 2,
    });

    const handleDelete = async () => {
        if (!selectedBlog) return;

        try {
            await deleteBlog(selectedBlog.id);
            toast.success("blog is deleted successfully")
            await refetch();
            closeDeleteModal();
        } catch (error: any) {
            toast.error(error);
        }
    };


    return (
        <DashboardLayout title="Our Blogs" addBtn="Add Blogs" onClick={openBlogModal}>

            {/* Loading Spinner */}
            {isLoading && (
                <Box sx={{ width: "100%", textAlign: "center", mt: 5 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error Message */}
            {isError && (
                <Typography color="error" sx={{ textAlign: "center", mt: 5 }}>
                    Failed to load blogs. Please try again.
                </Typography>
            )}

            {/* Blogs Grid */}
            {!isLoading && !isError && (
                <Box
                    sx={{
                        width: "100%",
                        display: { md: "flex", sm: "flex", xs: "block" },
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {blogs.map((blg: any) => (
                        <Box
                            key={blg.id}
                            sx={{
                                position: "relative",
                                mb: { md: 6, sm: 5, xs: 2 },
                                width: 300,
                                height: 250,
                                cursor: "pointer",
                                boxShadow: 2,
                                borderRadius: 1,
                                overflow: "hidden",

                                "&:hover .actions": {
                                    opacity: 1,
                                    visibility: "visible",
                                    transform: "translateY(0)",
                                    bgcolor: 'rgba(0,0,0,0.4)',
                                    width: '100%',
                                    height: '100%'
                                },
                            }}
                        >
                            <Box
                                component={"img"}
                                src={blg.image_base64}
                                sx={{
                                    objectFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                }}
                            />

                            {/* Hover Action Icons */}
                            <Box
                                className="actions"
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    p: 1,
                                    opacity: 0,
                                    visibility: "hidden",
                                    transform: "translateY(-10px)",
                                    transition: "0.3s ease",
                                }}
                            >
                                {/* Edit Button */}
                                <IconButton
                                    sx={{
                                        bgcolor: "#fff",
                                        borderRadius: "50%",
                                        p: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        width: 30,
                                        height: 30
                                    }}
                                    onClick={() => console.log("Edit blog")}
                                ><Edit /></IconButton>
                                {/* Delete Button */}
                                <IconButton
                                    sx={{
                                        bgcolor: "red",
                                        borderRadius: "50%",
                                        p: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: 'white',
                                        width: 30,
                                        height: 30
                                    }}
                                    onClick={() => {
                                        setSelectedBlog(blg);
                                        openDeleteModal();
                                    }}>
                                    <Delete />
                                </IconButton>
                                <Box

                                >
                                </Box>
                            </Box>
                        </Box>

                    ))}
                </Box>
            )}

            {/* Modal */}
            {isBlogModal && (
                <BlogsModal
                    open={isBlogModal}
                    onCloseModal={() => {
                        closeBlogModal();
                        refetch();
                    }}
                    title="Add Blog"
                />
            )}

            {isDeleteModal && (
                <ConfirmModal
                    open={isDeleteModal}
                    onCloseModal={closeDeleteModal}
                    title={`Are you sure you want to delete "${selectedBlog?.title}"?`}
                    btnText="Delete"
                    icon={<Delete />}
                    onClick={handleDelete}
                />
            )}

        </DashboardLayout>
    );
};

export default OurBlogs;
