// VideoPopup.tsx
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
import { useWishCard } from "../../context/WishCardContext";

interface VideoPopupProps {
  onClose: () => void;
}

const VideoPopup = ({
  onClose,
}: VideoPopupProps) => {

  const {
    tips,
    setTips,
    upload,
    setUpload,
    video,
    setVideo,
    duration,
    setDuration,
  } = useWishCard();

  const [loading, setLoading] = useState(false);

  const handleVideoFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
    }
  };

  const handleVideoDelete = () => {
    setVideo(null);
  };

  return (
    <PopupWrapper
      title="Video"
      onClose={onClose}
      sx={{ width: 300, height: 600, left: "2%", overflow: "hidden" }}
    >
      {tips && (
        <Box sx={{ height: "100%", overflow: "hidden" }}>
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
              Add a Free Video Message!
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
              <ListItem>You upload a Video recording</ListItem>
              <ListItem>We print a QR in the card</ListItem>
              <ListItem>They scan it to play the message</ListItem>
            </List>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}
            >
              <CustomButton
                title="Add Video"
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
        </Box>
      )}

      {upload && (
        <Box>
          {!video && (
            <>
              <Box
                component="input"
                type="file"
                accept="video/*"
                sx={{
                  position: "absolute",
                  width: "260px",
                  height: "110px",
                  opacity: 0,
                  cursor: "pointer",
                  left: 20,
                  zIndex: 10,
                }}
                onChange={handleVideoFileChange}
                multiple
              />
              <Box
                sx={{
                  width: "100%",
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
                }}
              >
                <ControlPoint fontSize="large" />
                Add Video
              </Box>
            </>
          )}

          {video && (
            <Box sx={{ width: "100%", height: "200px", position: "relative" }}>
              <video
                src={URL.createObjectURL(video)}
                controls
                autoPlay={false}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <IconButton
                onClick={handleVideoDelete}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "#f0f1f3",
                  "&:hover": { bgcolor: "#f0f1f3", color: "#fd1ecdff" },
                  zIndex: 99,
                }}
                size="small"
                aria-label="Delete uploaded video"
              >
                {/* Delete icon SVG or MUI icon */}
                <Delete />
              </IconButton>

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
                  <InfoOutline /> {(video.size / (1024 * 1024)).toFixed(0)} MB
                </Typography>
                <Typography
                  sx={{ display: "flex", alignItems: "center", gap: "3px" }}
                >
                  <PlayCircleOutline /> {Math.floor(duration ?? 0)}s
                </Typography>
              </Box>

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
                  I confirm this video does not violate Moonpig's content rule
                  as outlined in{" "}
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
                title="Upload Video"
                width="90%"
                loading={loading}
                onClick={async () => {
                  if (!video) {
                    console.warn("No video selected");
                    return;
                  }
                  setLoading(!loading);
                  const fileName = `${Date.now()}-${video.name}`;
                  console.log("Uploading:", fileName);

                  const { data, error } = await supabase.storage
                    .from("media")
                    .upload("video/" + fileName, video, {
                      cacheControl: "3600",
                      upsert: true,
                    });

                  if (error) {
                    console.error("Upload error:", error);
                    return;
                  }
                  const { data: urlData } = supabase.storage
                    .from("media")
                    .getPublicUrl(fileName);
                  setLoading(loading);
                  onClose();
                  setVideo(null);
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </PopupWrapper>
  );
};

export default VideoPopup;
