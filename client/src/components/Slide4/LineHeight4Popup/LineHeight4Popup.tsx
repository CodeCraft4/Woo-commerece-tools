// src/components/TextEditorPopups/LineHeight4Popup.tsx
import { Box, Divider, Typography, Slider } from "@mui/material";
import { useSlide4 } from "../../../context/Slide4Context";


const LineHeight4Popup = () => {
    const {
        lineHeight4,
        letterSpacing4,
        setLineHeight4,
        setLetterSpacing4,
        setTextElements4,
        selectedTextId4,
    } = useSlide4();


    /** Updates property for selected text or defaults */
    const updateTextProperty = (property: string, value: number) => {
        if (selectedTextId4) {
            setTextElements4((prev) =>
                prev.map((t) =>
                    t.id === selectedTextId4 ? { ...t, [property]: value } : t
                )
            );
        } else {
            if (property === "lineHeight") setLineHeight4(value);
            if (property === "letterSpacing") setLetterSpacing4(value);
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
                    value={lineHeight4}
                    min={0.8}
                    max={3}
                    step={0.1}
                    onChange={(_, val) =>
                        updateTextProperty("lineHeight", Number(val))
                    }
                    sx={{ color: "#1976d2" }}
                />
                <Typography fontSize={14} mb={2}>
                    {lineHeight4}
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
                    value={letterSpacing4}
                    min={-2}
                    max={10}
                    step={0.5}
                    onChange={(_, val) =>
                        updateTextProperty("letterSpacing", Number(val))
                    }
                    sx={{ color: "#1976d2" }}
                />
                <Typography fontSize={14}>
                    {letterSpacing4}px
                </Typography>
            </Box>
        </Box>
    );
};

export default LineHeight4Popup;
