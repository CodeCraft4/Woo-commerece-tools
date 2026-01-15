import { Adjust, Check, Delete, DrawOutlined, Flare, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { COLORS } from "../../../constant/color";
import { useSlide2 } from "../../../context/Slide2Context";
import { convertToRealisticSketch } from "../../../source/SketchEffect";

interface ImageAdjustmentProps {
    togglePopup?: any,
    onClose: () => void;
    activeIndex?: number;
    isAdminEditor?: boolean
}

const ImageAdjustment = (props: ImageAdjustmentProps) => {
    const { onClose, isAdminEditor } = props

    const { setImageFilter, imageFilter, setDraggableImages, selectedImg, setImages, setSelectedImage, setActiveFilterImageId, draggableImages } = useSlide2()

    const deleteSelectedImages = () => {
        if (selectedImg.length === 0) return;

        // 1. Delete from draggableImages (canvas)
        setDraggableImages(prev =>
            prev.filter(img => !selectedImg.includes(img.id))
        );

        // 2. Delete from PhotoPopup images list
        setImages(prev =>
            prev.filter(img => !selectedImg.includes(img.id))
        );

        // 3. REMOVE ALL CHECKS
        setSelectedImage([]); // ← THIS removes the blue check icons
    };


    const bringToFront = () => {
        setDraggableImages(prev => {
            const maxZ = Math.max(...prev.map(i => i.zIndex || 0));
            console.log(maxZ)

            return prev.map(img =>
                selectedImg.includes(img.id)
                    ? { ...img, zIndex: (img.zIndex || 0) + 1 }
                    : img
            );
        });
    };

    const sendToBack = () => {
        setDraggableImages(prev => {
            return prev.map(img =>
                selectedImg.includes(img.id)
                    ? { ...img, zIndex: Math.max((img.zIndex || 0) - 1, 0) }
                    : img
            );
        });
    };


    const applySketch = async () => {
        if (selectedImg.length === 0) return;

        const id = selectedImg[selectedImg.length - 1];
        const target = draggableImages.find(img => img.id === id);
        if (!target) return;

        const sketchUrl = await convertToRealisticSketch(target?.src);

        setDraggableImages(prev =>
            prev.map(img =>
                img.id === id ? { ...img, src: sketchUrl } : img
            )
        );
    };


    return (
        <Box sx={{ position: 'absolute', left: '33%', zIndex: 99, height: 600, bgcolor: 'white', mt: 1, borderRadius: 1 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "600px",
                    width: "auto",
                    justifyContent: 'center'
                }}
            >
                {/* Scrollable Icon Section */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",

                        "&::-webkit-scrollbar": {
                            width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#ccc",
                            borderRadius: "20px",
                        },
                    }}
                >

                    {/* <IconButton sx={editingButtonStyle}><Crop fontSize="large" /> Crop</IconButton> */}

                    <IconButton sx={editingButtonStyle}><Adjust fontSize="large" /> Adjust</IconButton>

                    <IconButton
                        sx={editingButtonStyle}
                        onClick={() => {
                            const lastSelected = selectedImg[selectedImg.length - 1];
                            setActiveFilterImageId(lastSelected);
                            setImageFilter(!imageFilter);
                        }}
                    >
                        <Flare fontSize="large" />
                        Effect
                    </IconButton>

                    {!isAdminEditor && (
                        <IconButton sx={editingButtonStyle} onClick={bringToFront}>
                            <KeyboardArrowUp fontSize="large" /> Front
                        </IconButton>
                    )}

                    {!isAdminEditor && (
                        <IconButton sx={editingButtonStyle} onClick={sendToBack}>
                            <KeyboardArrowDown fontSize="large" /> Back
                        </IconButton>
                    )}

                    <IconButton
                        sx={editingButtonStyle}
                        onClick={applySketch}
                    >
                        <DrawOutlined fontSize="large" />
                        Sketch
                    </IconButton>


                    <IconButton
                        sx={editingButtonStyle}
                        onClick={deleteSelectedImages}
                    >
                        <Delete />
                        Delete
                    </IconButton>

                </Box>

                {/* Fixed Check Button at Bottom */}
                <Box
                    sx={{
                        p: 1,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <IconButton
                        sx={{
                            ...editingButtonStyle,
                            bgcolor: COLORS.green,
                            color: "white",
                            width: 45,
                            height: 45,
                        }}
                        onClick={onClose}
                    >
                        <Check fontSize="large" />
                    </IconButton>
                </Box>
            </Box>

        </Box>
    );
};

export default ImageAdjustment;

const editingButtonStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "13px",
    color: "#212121",
    "&:hover": {
        color: "#3a7bd5",
    },
};