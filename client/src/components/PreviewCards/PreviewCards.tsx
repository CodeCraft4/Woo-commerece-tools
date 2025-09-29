import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "./card.css";
import BearPNG from "../../assets/bear.png";
import { useWishCard } from "../../context/WishCardContext";
import {
  fetchAudioLatestMedia,
  fetchVideoLatestMedia,
} from "../../source/source";
import QrGenerator from "../QR-code/Qrcode";
import { useAuth } from "../../context/AuthContext";

const PreviewBookCard = () => {
  const [currentLocation, setCurrentLocation] = useState(1);
  const {user} = useAuth()

  const {
    poster,
    // title,
    images,
    texts,
    fontSize,
    fontWeight,
    textAlign,
    fontColor,
    oneTextValue,
    multipleTextValue,
  } = useWishCard();

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const numOfPapers = 2;
  const maxLocation = numOfPapers + 1;

  const goNextPage = () => {
    if (currentLocation < maxLocation) {
      setCurrentLocation((prev) => prev + 1);
    }
  };

  const goPrevPage = () => {
    if (currentLocation > 1) {
      setCurrentLocation((prev) => prev - 1);
    }
  };

  const getBookTransform = () => {
    if (currentLocation === 1) return "translateX(0%)";
    if (currentLocation === maxLocation) return "translateX(100%)";
    return "translateX(50%)";
  };

  useEffect(() => {
     if (user) {
    fetchVideoLatestMedia(user.id, setMediaUrl);
  }
    fetchAudioLatestMedia(setAudioUrl);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        m: "auto",
        flexDirection: "column",
        mt: 2,
      }}
    >
      <div className="book-container">
        {/* Book */}
        <div
          id="book"
          className="book"
          style={{
            transform: getBookTransform(),
            transition: "transform 0.5s ease",
          }}
        >
          {/* Paper 1 */}
          <div
            id="p1"
            className={`paper ${currentLocation > 1 ? "flipped" : ""}`}
            style={{ zIndex: currentLocation > 1 ? 1 : 2 }}
          >
            <div className="front">
              <div id="f1" className="front-content">
                <Box
                  sx={{ height: "100%", width: "100%", bgcolor: "#c2f0cfff" }}
                >
                  <Box
                    component="img"
                    className="cover-img"
                    src={poster ? poster : BearPNG}
                    alt="dog"
                     sx={{width:'100%',height:'100%',objectFit:'cover'}}
                  />

                  {/* Title */}
                  {/* <Typography
                    variant="h4"
                    sx={{ fontSize: "35px", fontFamily: "cursive", p: 1 }}
                  >
                    HAPPY BIRTHDAY
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: "35px",
                      fontFamily: "fantasy",
                      p: 1,
                      color: "#e17f95",
                      fontWeight: 800,
                    }}
                  >
                    {title}
                  </Typography> */}
                </Box>
              </div>
            </div>

            <div className="back">
              <div id="b1" className="back-content">
                <Box>
                  {mediaUrl && <QrGenerator url={mediaUrl} />}
                  {audioUrl && <QrGenerator url={audioUrl} />}

                  {images.map((img: any) => {
                    return (
                      <Box
                        key={img.id}
                        component="img"
                        src={img.src}
                        sx={{
                          width: img.width ? img.width : 200,
                          height: img.height ? img.height : 200,
                          position: "absolute",
                          left: img.x,
                          top: img.y,
                          borderRadius: 2,
                          objectFit: "cover",
                        }}
                      />
                    );
                  })}
                </Box>
              </div>
            </div>
          </div>

          {/* Paper 2 */}
          <div
            id="p2"
            className={`paper ${currentLocation > 2 ? "flipped" : ""}`}
            style={{ zIndex: currentLocation > 2 ? 2 : 1 }}
          >
            <div className="front">
              <div id="f2" className="front-content">
                {oneTextValue && (
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        p: 2,
                        textAlign: textAlign,
                        fontSize: fontSize,
                        fontWeight: fontWeight,
                        color: fontColor,
                        // transform: `rotate(${rotation}deg)`,
                      }}
                    >
                      {oneTextValue}
                    </Box>
                  </Box>
                )}

                {multipleTextValue && (
                  <Box
                    sx={{
                      height: "100%",
                      width: "100%",
                      borderRadius: "6px",
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {texts.map((e, index) => (
                      <Box
                        sx={{
                          height: "100%",
                          width: "100%",
                          p: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                        key={index}
                      >
                        <Typography
                          sx={{
                            height: 150,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "2px dashed #3a7bd5",
                            fontSize: fontSize,
                          }}
                        >
                          {e}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                {/* <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    m: "auto",
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{ fontSize: fontSize ? fontSize : "20px" }}
                  >{`${
                    oneTextValue ? oneTextValue : "Some Intro"
                  }`}</Typography>
                </Box> */}
              </div>
            </div>
            <div className="back">
              <div id="b2" className="back-content">
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    fontWeight: "bold",
                    flexDirection: "column",
                    p: 2,
                    height: "100%",
                    borderRadius: "10px",
                    bgcolor: "white",
                    color:'black'
                  }}
                >
                  <Box
                   component={'img'}
                   src="/assets/images/blackLOGO.png"
                   sx={{
                    width:'300px'
                   }}
                  />
                  <Typography fontSize={'12px'} pt={3}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Doloremque recusandae alias dignissimos sunt ab! Pariatur
                    minima placeat hic enim quis facilis ducimus neque culpa
                    sequi delectus.
                  </Typography>
                </Box>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Box sx={{ display: "flex", gap: "10px", alignItems: "center", mt: 3 }}>
        {/* Prev Button */}
        <IconButton
          id="prev-btn"
          onClick={goPrevPage}
          disabled={currentLocation === 1}
          sx={{
            ...changeModuleBtn,
            border: `${
              currentLocation === 1 ? "1px solid gray" : "1px solid #3a7bd5"
            }`,
          }}
        >
          <KeyboardArrowLeft fontSize="large" />
        </IconButton>

        {/* Next Button */}
        <IconButton
          id="next-btn"
          onClick={goNextPage}
          disabled={currentLocation === maxLocation}
          sx={{
            ...changeModuleBtn,
            border: `${
              currentLocation === maxLocation
                ? "1px solid gray"
                : "1px solid #3a7bd5"
            }`,
          }}
        >
          <KeyboardArrowRight fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PreviewBookCard;

const changeModuleBtn = {
  border: "1px solid #3a7bd5",
  p: 1,
  display: "flex",
  justifyContent: "center",
  color: "#212121",
  alignItems: "center",
  "&.Mui-disabled": {
    color: "gray",
    cursor: "default",
    pointerEvents: "none",
  },
};
