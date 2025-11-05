// src/components/TextEditorPopups/LineHeight3Popup.tsx
import { Box, Divider, Typography, Slider } from "@mui/material";
import { useSlide3 } from "../../../context/Slide3Context";


const LineHeight3Popup = () => {
    const {
        lineHeight3,
        letterSpacing3,
        setLineHeight3,
        setLetterSpacing3,
        setTextElements3,
        selectedTextId3,
    } = useSlide3();


    /** Updates property for selected text or defaults */
    const updateTextProperty = (property: string, value: number) => {
        if (selectedTextId3) {
            setTextElements3((prev) =>
                prev.map((t) =>
                    t.id === selectedTextId3 ? { ...t, [property]: value } : t
                )
            );
        } else {
            if (property === "lineHeight") setLineHeight3(value);
            if (property === "letterSpacing") setLetterSpacing3(value);
        }
    };

    return (
        <Box
            sx={{
                width: { md: '90%', sm: 230, xs: "100%" },
                height: { md: 400, sm: 400, xs: 250 },
                mt: { md: 4, sm: 4, xs: 0 },
            }}
        >
            <Box
                sx={{
                    p: 2,
                    textAlign: "start",
                    overflowY: "auto",
                }}
            >
                {/* Line Height Section */}
                <Typography
                    fontSize={{ md: 18, sm: 18, xs: 15 }}
                    fontWeight="bold"
                    mb={1}
                >
                    Line Height
                </Typography>
                <Slider
                    value={lineHeight3}
                    min={0.8}
                    max={3}
                    step={0.1}
                    onChange={(_, val) =>
                        updateTextProperty("lineHeight", Number(val))
                    }
                    sx={{ color: "#1976d2" }}
                />
                <Typography fontSize={14} mb={2}>
                    {lineHeight3}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Letter Spacing Section */}
                <Typography
                    fontSize={{ md: 18, sm: 18, xs: 15 }}
                    fontWeight="bold"
                    mb={1}
                >
                    Letter Spacing
                </Typography>
                <Slider
                    value={letterSpacing3}
                    min={-2}
                    max={10}
                    step={0.5}
                    onChange={(_, val) =>
                        updateTextProperty("letterSpacing", Number(val))
                    }
                    sx={{ color: "#1976d2" }}
                />
                <Typography fontSize={14}>
                    {letterSpacing3}px
                </Typography>
            </Box>
        </Box>
    );
};

export default LineHeight3Popup;
