// Video3Popup.tsx
import { useEffect, useState } from "react";
import { Box, Typography, IconButton, List, ListItem } from "@mui/material";
import {
  ControlPoint,
  Delete,
  InfoOutline,
  PlayCircleOutline,
} from "@mui/icons-material";
import CustomButton from "../../CustomButton/CustomButton";
import TipsVideo from "/assets/images/diy-tips.mp4";
import PopupWrapper from "../../PopupWrapper/PopupWrapper";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSlide3 } from "../../../context/Slide3Context";
import toast from "react-hot-toast";
import { COLORS } from "../../../constant/color";

interface Video3PopupProps {
  onClose: () => void;
  activeIndex?: number;
}

const Video3Popup = ({ onClose }: Video3PopupProps) => {
  const {
    tips3,
    setTips3,
    upload3,
    setUpload3,
    video3,
    setVideo3,
    duration3,
    setDuration3,
    setSelectedVideoUrl3,
    selectedVideoUrl3,
    setQrPosition3,
  } = useSlide3();

  const [loading, setLoading] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { user } = useAuth();
  const generateId = () => Date.now() + Math.random();

  // ✅ Handle multiple video files
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setFileError(null);

    const validFiles: any = Array.from(files).filter((file) => {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 50) {
        setFileError(`❌ ${file.name.slice(0, 20)} is too large (max 50MB).`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    setVideo3(validFiles); // store as an array
  };

  // ✅ Save video URL to the user's "video" array in DB
  const saveVideoUrlToDB = async (videoId: string, videoUrl: string) => {
    if (!user?.id) {
      console.error("❌ No authenticated user found");
      return;
    }

    try {
      const { data: userData, error: fetchError } = await supabase
        .from("Users")
        .select("video")
        .eq("auth_id", user.id)
        .single();

      console.log("📦 Current user data:", userData);

      if (fetchError) {
        console.error("❌ Error fetching user data:", fetchError);
        return;
      }

      const newVideo = { id: videoId, url: videoUrl };
      const updatedVideos = userData?.video
        ? [...userData.video, newVideo]
        : [newVideo];

      console.log("🆕 New video array:", updatedVideos);

      const { error: updateError } = await supabase
        .from("Users")
        .update({ video: updatedVideos })
        .eq("auth_id", user.id);

      if (updateError) {
        console.error("❌ Error updating user videos:", updateError);
        return;
      }

      console.log("✅ Video URL saved successfully:", videoUrl);
    } catch (err) {
      console.error("❌ Error saving video to DB:", err);
    }
  };

  // ✅ Upload video to Supabase Storage
  const handleVideoUpload = async () => {
    if (!video3 || video3.length === 0) {
      alert("No video selected");
      return;
    }

    setLoading(true);

    try {
      for (const file of video3) {
        const videoId = generateId().toString();
        const fileExt = file.name.split(".").pop();
        const fileName = `${videoId}.${fileExt}`;
        const filePath = `video/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("media")
          .getPublicUrl(filePath);

        await saveVideoUrlToDB(videoId, publicData.publicUrl);

        // Update qrPosition with the new video URL
        setQrPosition3((prev) => ({
          ...prev,
          url: publicData.publicUrl,
          zIndex: 1000, // Reset zIndex on new upload
        }));
      }

      alert("✅ All videos uploaded successfully!");

      await fetchUserVideos();

      setVideo3(null);
      setDuration3(0);
      setUpload3(false);
      // onClose();
    } catch (err) {
      console.error("Error uploading videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoDelete = () => {
    setVideo3(null);
  };

  const [userVideos, setUserVideos] = useState<{ id: string; url: string }[]>(
    []
  );

  // ✅ Fetch user videos
  const fetchUserVideos = async () => {
    if (!user?.id) return;
    console.log("🎯 Fetching videos for user:", user.id);

    const { data, error } = await supabase
      .from("Users")
      .select("video")
      .eq("auth_id", user.id)
      .single();

    console.log("📥 Supabase fetch result:", { data, error });

    if (error) {
      console.error("❌ Error fetching videos:", error);
      return;
    }

    if (data?.video) {
      console.log("✅ Fetched user videos:", data.video);
      setUserVideos(data.video);
    } else {
      console.log("⚠️ No videos found for user.");
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadVideos = async () => {
      try {
        await fetchUserVideos();
      } catch (err) {
        console.error("Error loading videos:", err);
      }
    };

    loadVideos();
  }, [user]);

  // Delete....
  const handleDeleteVideo = async (videoId: string) => {
    if (!user?.id) return;

    const { data: userData } = await supabase
      .from("Users")
      .select("video")
      .eq("auth_id", user.id)
      .single();

    if (!userData?.video) return;

    const updated = userData.video.filter((v: any) => v.id !== videoId);

    const { error } = await supabase
      .from("Users")
      .update({ video: updated })
      .eq("auth_id", user.id);

    if (!error) {
      setUserVideos(updated);
      toast.success("✅ Video deleted successfully");
    }
  };

  return (
    <PopupWrapper
      title="Video"
      onClose={onClose}
      sx={{
        width: { md: 300, sm: 300, xs: "95%" },
        height: {md:600,sm:600,xs:500},
        left: { md: "33.5%", sm: "0%", xs: 0 },
        mt: { md: 0, sm: 0, xs: 0 },
        overflowY: "hidden",
      }}
    >
      {tips3 && (
        <Box sx={{ height: "100%", overflow: "hidden" }}>
          <Box
            sx={{
              height: 200,
              width: "100%",
              bgcolor: "gray",
              position: "relative",
              display: { md: 'flex', sm: 'flex', xs: 'none' }
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
                fontSize: "23px",
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
                  setTips3(false);
                  setUpload3(true);
                }}
              />
              <CustomButton
                title="Maybe Later"
                width="100%"
                variant="outlined"
                onClick={() => {
                  setTips3(false);
                  setUpload3(true);
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {upload3 && (
        <Box>
          {!video3 && (
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

              {fileError && (
                <Typography
                  sx={{
                    color: "red",
                    fontSize: "13px",
                    mt: 1,
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {fileError}
                </Typography>
              )}

              {userVideos.length > 0 && (
                <Box
                  mt={3}
                  sx={{
                    height: "400px",
                    overflowY: "auto",
                    p: 1,
                    "&::-webkit-scrollbar": {
                      height: "6px",
                      width: "5px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "#f1f1f1",
                      borderRadius: "20px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: COLORS.primary,
                      borderRadius: "20px",
                    },
                  }}
                >
                  <Typography
                    sx={{ fontSize: "16px", fontWeight: "bold", mb: 1 }}
                  >
                    Your Uploaded Videos:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {userVideos.map((v) => (
                      <Box
                        key={v.id}
                        onClick={() =>
                          setSelectedVideoUrl3((prev) =>
                            prev === v.url ? null : v.url
                          )
                        }
                        sx={{
                          position: "relative",
                          border:
                            selectedVideoUrl3 === v.url
                              ? "3px solid #3a7bd5"
                              : "1px solid #ccc",
                          borderRadius: 2,
                          overflow: "hidden",
                          width: "100%",
                          cursor: "pointer",
                          opacity: selectedVideoUrl3 === v.url ? 1 : 0.9,
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            borderColor: "#3a7bd5",
                            opacity: 1,
                          },
                        }}
                      >
                        {/* 🎥 Video */}
                        <video
                          id={`video-${v.id}`}
                          src={v.url}
                          controls={playingVideoId ? true : false}
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "contain",
                            // objectFit: "cover",
                          }}
                          onPlay={() => setPlayingVideoId(v.id)}
                          onPause={() => setPlayingVideoId(null)}
                          onEnded={() => setPlayingVideoId(null)}
                        />

                        {/* ▶ Overlay Play Button (hidden when playing) */}
                        {playingVideoId !== v.id && (
                          <Box
                            onClick={(e) => {
                              e.stopPropagation(); // prevent parent onClick
                              const video = document.getElementById(
                                `video-${v.id}`
                              ) as HTMLVideoElement;
                              if (video) {
                                // Pause all other videos
                                document
                                  .querySelectorAll("video")
                                  .forEach((vid) => {
                                    if (vid !== video) vid.pause();
                                  });

                                // Play/pause toggle
                                if (video.paused) {
                                  video.play();
                                } else {
                                  video.pause();
                                }
                              }
                            }}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              bgcolor: "rgba(0, 0, 0, 0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                              "&:hover": {
                                bgcolor: "rgba(0, 0, 0, 0.4)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                bgcolor: "#fff",
                                borderRadius: "50%",
                                width: 50,
                                height: 50,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `3px solid ${COLORS.seconday}`,
                                outline: "2px solid white",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="30"
                                viewBox="0 0 24 24"
                                width="30"
                                fill="#412485ff"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </Box>
                          </Box>
                        )}

                        {/* 🗑 Delete Button */}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(v.id);
                          }}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "#fff",
                            "&:hover": { bgcolor: "#f3f0f0ff", color: "red" },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </>
          )}

          {video3 && (
            <Box sx={{ width: "100%", height: "200px", position: "relative" }}>
              <video
                src={URL.createObjectURL(video3[0])}
                controls
                autoPlay={false}
                onLoadedMetadata={(e) => setDuration3(e.currentTarget.duration)}
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
                  <InfoOutline /> {(video3[0].size / (1024 * 1024)).toFixed(0)}{" "}
                  MB
                </Typography>
                <Typography
                  sx={{ display: "flex", alignItems: "center", gap: "3px" }}
                >
                  <PlayCircleOutline /> {Math.floor(duration3 ?? 0)}s
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
                  I confirm this video does not violate DIY Personalisation
                  content rule as outlined in{" "}
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
                onClick={handleVideoUpload}
              />
            </Box>
          )}
        </Box>
      )}
    </PopupWrapper>
  );
};

export default Video3Popup;
