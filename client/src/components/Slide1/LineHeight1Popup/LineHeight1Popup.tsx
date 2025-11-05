// src/components/TextEditorPopups/LineHeight1Popup.tsx
import { Box, Divider, Typography, Slider } from "@mui/material";
import { useSlide1 } from "../../../context/Slide1Context";


const LineHeight1Popup = () => {
    const {
        lineHeight1,
        letterSpacing1,
        setLineHeight1,
        setLetterSpacing1,
        setTextElements1,
        selectedTextId1,
    } = useSlide1();


    /** Updates property for selected text or defaults */
    const updateTextProperty = (property: string, value: number) => {
        if (selectedTextId1) {
            setTextElements1((prev) =>
                prev.map((t) =>
                    t.id === selectedTextId1 ? { ...t, [property]: value } : t
                )
            );
        } else {
            if (property === "lineHeight") setLineHeight1(value);
            if (property === "letterSpacing") setLetterSpacing1(value);
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
                    value={lineHeight1}
                    min={0.8}
                    max={3}
                    step={0.1}
                    onChange={(_, val) =>
                        updateTextProperty("lineHeight", Number(val))
                    }
                    sx={{ color: "#1976d2" }}
                />
                <Typography fontSize={14} mb={2}>
                    {lineHeight1}
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
                    value={letterSpacing1}
                    min={-2}
                    max={10}
                    step={0.5}
                    onChange={(_, val) =>
                        updateTextProperty("letterSpacing", Number(val))
                    }
                    sx={{ color: "#1976d2" }}
                />
                <Typography fontSize={14}>
                    {letterSpacing1}px
                </Typography>
            </Box>
        </Box>
    );
};

export default LineHeight1Popup;
