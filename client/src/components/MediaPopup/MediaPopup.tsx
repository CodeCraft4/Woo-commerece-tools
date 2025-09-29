// MediaPopup.tsx
import React, { useState } from "react";
import { Box, Typography, IconButton, List, ListItem } from "@mui/material";
import {
  ControlPoint,
  Delete,
  InfoOutline,
  PlayCircleOutline,
} from "@mui/icons-material";
import CustomButton from "../CustomButton/CustomButton";
import TipsVideo from "../../assets/vedioTip.mp4";
import PopupWrapper from "../PopupWrapper/PopupWrapper";
import { supabase } from "../../supabase/supabase";

interface MediaPopupProps {
  onClose: () => void;
  tips: boolean;
  setTips: (value: boolean) => void;
  upload: boolean;
  setUpload: (value: boolean) => void;
  mediaFile: File | null;
  setMediaFile: (file: File | null) => void;
  duration: number | null;
  setDuration: (duration: number | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDelete: () => void;
  mediaType: "video" | "audio";
}

const MediaPopup = ({
  onClose,
  tips,
  setTips,
  upload,
  setUpload,
  mediaFile,
  // setMediaFile,
  duration,
  setDuration,
  handleFileChange,
  handleDelete,
  mediaType,
}: MediaPopupProps) => {
  const isVideo = mediaType === "video";
  const [loading, setLoading] = useState(false);

  return (
    <PopupWrapper
      title={isVideo ? "Video" : "Audio"}
      onClose={onClose}
      sx={{ width: 300, height: 600, left: "12%", overflow: "hidden" }}
    >
      {tips && (
        <>
          <Box
            sx={{
              height: 200,
              width: "100%",
              bgcolor: "gray",
              position: "relative",
            }}
          >
            <video
              src={TipsVideo}
              autoPlay
              loop
              muted
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
          <Box p={2}>
            <Typography
              sx={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#363636ff",
                textAlign: "center",
              }}
            >
              Add a Free {isVideo ? "Video" : "Audio"} Message!
            </Typography>
            <List
              component="ol"
              sx={{
                listStyleType: "decimal",
                fontSize: "14px",
                color: "#444444ff",
                pl: 2,
                "& .MuiListItem-root": {
                  display: "list-item",
                  padding: "4px",
                  margin: 0,
                },
              }}
            >
              <ListItem>
                You upload a {isVideo ? "Video" : "Audio"} recording
              </ListItem>
              <ListItem>We print a QR in the card</ListItem>
              <ListItem>They scan it to play the message</ListItem>
            </List>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}
            >
              <CustomButton
                title={`Add ${isVideo ? "Video" : "Audio"}`}
                width="100%"
                onClick={() => {
                  setTips(false);
                  setUpload(true);
                }}
              />
              <CustomButton
                title="Maybe Later"
                width="100%"
                variant="outlined"
                onClick={() => {
                  onClose();
                  setTips(!tips);
                }}
              />
            </Box>
          </Box>
        </>
      )}

      {upload && (
        <Box>
          {!mediaFile && (
            <>
              <Box
                component="input"
                type="file"
                accept={isVideo ? "video/*" : "audio/*"}
                sx={{
                  position: "absolute",
                  width: "260px",
                  height: "110px",
                  opacity: 0,
                  cursor: "pointer",
                  left: 0,
                  zIndex: 10,
                }}
                onChange={handleFileChange}
                multiple
              />
              <Box
                sx={{
                  width: "255px",
                  height: "100px",
                  borderRadius: "8px",
                  border: "3px dashed #3a7bd5",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  userSelect: "none",
                  pointerEvents: "none",
                  color: "#3a7bd5",
                  fontWeight: "bold",
                  flexDirection: "column",
                  fontSize: "20px",
                  m: 1,
                }}
              >
                <ControlPoint fontSize="large" />
                Add {isVideo ? "Video" : "Audio"}
              </Box>
            </>
          )}

          {mediaFile && (
            <Box
              sx={{
                width: "100%",
                height: isVideo ? 200 : "auto",
                position: "relative",
              }}
            >
              {isVideo ? (
                <video
                  src={URL.createObjectURL(mediaFile)}
                  controls
                  autoPlay={false}
                  onLoadedMetadata={(e) =>
                    setDuration(e.currentTarget.duration)
                  }
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <audio
                  src={URL.createObjectURL(mediaFile)}
                  controls
                  onLoadedMetadata={(e) =>
                    setDuration(e.currentTarget.duration)
                  }
                  style={{ width: "100%" }}
                />
              )}

              <IconButton
                onClick={handleDelete}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "#f0f1f3",
                  zIndex: 99,
                  "&:hover": { bgcolor: "#f0f1f3", color: "#fd1ecdff" },
                }}
                size="small"
                aria-label={`Delete uploaded ${isVideo ? "video" : "audio"}`}
              >
                <Delete />
              </IconButton>

              {isVideo && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 4,
                    mt: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{ display: "flex", alignItems: "center", gap: "3px" }}
                  >
                    <InfoOutline />{" "}
                    {(mediaFile.size / (1024 * 1024)).toFixed(0)} MB
                  </Typography>
                  <Typography
                    sx={{ display: "flex", alignItems: "center", gap: "3px" }}
                  >
                    <PlayCircleOutline /> {Math.floor(duration ?? 0)}s
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  p: 3,
                  mt: 1,
                  borderTop: "1px solid #d3d3d3ff",
                  borderBottom: "1px solid #d3d3d3ff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <input
                  type="checkbox"
                  style={{ width: 80, height: 80, cursor: "pointer" }}
                />
                <Typography sx={{ fontSize: "15px", color: "#929292ff" }}>
                  I confirm this {isVideo ? "video" : "audio"} does not violate
                  Moonpig's content rule as outlined in{" "}
                  <Box
                    component="a"
                    href="#"
                    sx={{
                      textDecoration: "none",
                      color: "#3a7bd5",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    IDEA term and condition
                  </Box>
                </Typography>
              </Box>
              <br />
              <CustomButton
                title={`Upload ${isVideo ? "Video" : "Audio"}`}
                width="90%"
                loading={loading}
                onClick={async () => {
                  if (!mediaFile) {
                    console.warn("No video selected");
                    return;
                  }
                  setLoading(!loading);
                  const fileName = `${Date.now()}-${mediaFile.name}`;
                  const {error } = await supabase.storage
                    .from("media")
                    .upload("audio/" + fileName, mediaFile, {
                      cacheControl: "3600",
                      upsert: true,
                    });

                  if (error) {
                    console.error("Upload error:", error);
                    return;
                  }
                  // const { data: urlData } = supabase.storage
                  //   .from("media")
                  //   .getPublicUrl(fileName);
                  // setLoading(loading);
                  // onClose();
                  // setMediaFile(null);
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </PopupWrapper>
  );
};

export default MediaPopup;
