import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "./card.css";
import QrGenerator from "../QR-code/Qrcode";
import { useSlide2 } from "../../context/Slide2Context";
import { useSlide3 } from "../../context/Slide3Context";
import GlobalWatermark from "../GlobalWatermark/GlobalWatermark";
import { useSlide1 } from "../../context/Slide1Context";
import { useSlide4 } from "../../context/Slide4Context";

const PreviewBookCard = () => {
  const [currentLocation, setCurrentLocation] = useState(1);

  const {
    texts1,
    oneTextValue1,
    multipleTextValue1,
    draggableImages1,
    fontColor1,
    fontFamily1,
    fontSize1,
    fontWeight1,
    selectedImg1,
    verticalAlign1,
    selectedVideoUrl1,
    qrPosition1,
    textAlign1,
    selectedLayout1,
    selectedAudioUrl1,
    qrAudioPosition1,
    textElements1,
    selectedAIimageUrl1,
    selectedStickers,
    isAIimage,
    aimage1,
  } = useSlide1();

  const {
    texts,
    oneTextValue,
    multipleTextValue,
    draggableImages,
    fontColor,
    fontFamily,
    fontSize,
    fontWeight,
    selectedImg,
    verticalAlign,
    selectedVideoUrl,
    selectedAudioUrl,
    qrPosition,
    textAlign,
    selectedLayout,
    textElements,
    qrAudioPosition,
    selectedAIimageUrl2,
    selectedStickers2,
    isAIimage2,
    aimage2,
  } = useSlide2();

  const {
    texts3,
    oneTextValue3,
    multipleTextValue3,
    draggableImages3,
    fontColor3,
    fontFamily3,
    fontSize3,
    fontWeight3,
    selectedImg3,
    verticalAlign3,
    selectedVideoUrl3,
    qrPosition3,
    textAlign3,
    selectedLayout3,
    selectedAudioUrl3,
    qrAudioPosition3,
    textElements3,
    selectedAIimageUrl3,
    selectedStickers3,
    isAIimage3,
    aimage3,
  } = useSlide3();

  const {
    texts4,
    oneTextValue4,
    multipleTextValue4,
    draggableImages4,
    fontColor4,
    fontFamily4,
    fontSize4,
    fontWeight4,
    selectedImg4,
    verticalAlign4,
    selectedVideoUrl4,
    qrPosition4,
    textAlign4,
    selectedLayout4,
    selectedAudioUrl4,
    qrAudioPosition4,
    textElements4,
    selectedAIimageUrl4,
    selectedStickers4,
    isAIimage4,
    aimage4,
  } = useSlide4();

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
              <div id="sf1" className="front-content">
                {/* FirstSlide */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  {selectedVideoUrl1 && (
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        textAlign: "center",
                         top: qrPosition1.y,
                        width: qrPosition1.width,
                        height: qrPosition1.height,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/QR-tips.jpg"
                        sx={{
                          width: "100%",
                          height: 200,
                          position: "relative",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 46,
                          height: 100,
                          width: 100,
                          borderRadius: 2,
                          ml: "10px",
                          // bgcolor:'red',
                          p: 1,
                        }}
                      >
                        <QrGenerator
                          url={qrPosition1.url || selectedVideoUrl1}
                          size={Math.min(qrPosition1.width, qrPosition1.height)}
                        />
                      </Box>
                    </Box>
                  )}

                  {selectedAudioUrl1 && (
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        top: qrAudioPosition1.y,
                        height: qrAudioPosition1.height,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/QR-tips.jpg"
                        sx={{
                          width: "100%",
                          height: 200,
                          position: "relative",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 46,
                          height: 100,
                          width: 100,
                          borderRadius: 2,
                          ml: "10px",
                          // bgcolor:'red',
                          p: 1,
                        }}
                      >
                        <QrGenerator
                          url={qrAudioPosition1.url || selectedAudioUrl1}
                          size={Math.min(
                            qrAudioPosition1.width,
                            qrAudioPosition1.height
                          )}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* 🖼️ Only selected images */}
                  {draggableImages1
                    .filter((img: any) => selectedImg1?.includes(img.id))
                    .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((img: any) => (
                      <Box
                        key={img.id}
                        component="img"
                        src={img.src}
                        sx={{
                          // position: "absolute",
                          width: img.width,
                          height: img.height,
                          left: img.x,
                          top: img.y,
                          transform: `rotate(${img.rotation}deg)`,
                          borderRadius: 2,
                          objectFit: "cover",
                          zIndex: img.zIndex || 1,
                        }}
                      />
                    ))}

                  {multipleTextValue1 &&
                    texts3.map((e) => (
                      <Box
                        key={e}
                        sx={{
                          position: "relative",
                          height: "160px",
                          width: "100%",
                          mb: 2,
                          display: "flex",
                          justifyContent:
                            e.verticalAlign1 === "top"
                              ? "flex-start"
                              : e.verticalAlign1 === "center"
                              ? "center"
                              : "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            fontSize: e.fontSize1,
                            fontWeight: e.fontWeight1,
                            color: e.fontColor1,
                            fontFamily: e.fontFamily1,
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                            whiteSpace: "pre-line",
                            // border: "3px dashed #3a7bd5",
                            borderRadius: "6px",
                            width: "100%",
                            height: "80%",
                            dipslay: "flex",
                            alignItems: "center",
                            m: "auto",
                            justifyContent:
                              e.verticalAlign1 === "top"
                                ? "flex-start"
                                : e.verticalAlign1 === "center"
                                ? "center"
                                : "flex-end",
                            p: 1,
                          }}
                        >
                          {e.value}
                        </Typography>
                      </Box>
                    ))}

                  {/* 📝 Single Text Layout */}
                  {selectedLayout1 === "oneText" && (
                    <Box
                      sx={{
                        // position: "absolute",
                        display: "flex",
                        alignItems:
                          verticalAlign1 === "top"
                            ? "flex-start"
                            : verticalAlign1 === "center"
                            ? "center"
                            : "flex-end",
                        justifyContent:
                          verticalAlign1 === "top"
                            ? "flex-start"
                            : verticalAlign1 === "center"
                            ? "center"
                            : "flex-end",
                        height: "100%",
                        color: fontColor1,
                        fontFamily1,
                        fontSize1,
                        fontWeight1,
                        textAlign1,
                        whiteSpace: "pre-wrap",
                        width: "100%",
                      }}
                    >
                      {oneTextValue1}
                    </Box>
                  )}

                  {/* ✍️ Multiple Text Layout */}
                  {selectedLayout1 === "multipleText" && texts1.length > 0 && (
                    <Box
                      sx={{
                        height: "100%",
                        width: "375px",
                        borderRadius: "6px",
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {texts1.map((textObj: any, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            position: "relative",
                            height: "175px",
                            width: "100%",
                            mb: 2,
                            display: "flex",
                            justifyContent:
                              textObj.verticalAlign1 === "top"
                                ? "flex-start"
                                : textObj.verticalAlign1 === "center"
                                ? "center"
                                : "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              textAlign: "center",
                              fontSize: textObj.fontSize1,
                              fontWeight: textObj.fontWeight1,
                              color: textObj.fontColor1,
                              fontFamily: textObj.fontFamily1,
                              lineHeight: 1.4,
                              wordBreak: "break-word",
                              whiteSpace: "pre-line",
                              border: "3px dashed #3a7bd5",
                              borderRadius: "6px",
                              width: "100%",
                              p: 1,
                            }}
                          >
                            {textObj.value || "Add Text"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {textElements1 &&
                    textElements1.map((e) => (
                      <Typography
                        key={e.id}
                        sx={{
                          border: "1px dashed blue",
                          fontSize: e.fontSize,
                          color: e.fontColor,
                          fontFamily: e.fontFamily,
                          fontWeight: e.fontWeight,
                          textAlign: e.textAlign || "center",
                          position: "absolute", // Use absolute positioning
                          left: e.position.x, // X position
                          top: e.position.y, // Y position
                          width: e.size.width, // Width from size object
                          height: "auto", // Height from size object
                          zIndex: e.zIndex, // Apply zIndex
                          transform: `rotate(${e.rotation}deg)`, // Apply rotation
                          padding: "5px",
                          boxSizing: "border-box",
                        }}
                      >
                        {e.value} {/* Display the text value */}
                      </Typography>
                    ))}

                  {isAIimage && (
                    <img
                      src={`${selectedAIimageUrl1}`}
                      alt="AIimage"
                      style={{
                        position: "absolute", // 👈 so it can use top/left
                        left: aimage1.x, // 👈 saved x position
                        top: aimage1.y, // 👈 saved y position
                        width: `${aimage1.width}px`, // 👈 saved width
                        height: `${aimage1.height}px`, // 👈 saved height
                        objectFit: "contain",
                        zIndex: 10,
                        pointerEvents: "none", // 👈 prevents accidental clicking
                      }}
                    />
                  )}

                  {/* 🧷 Preview Stickers */}
                  {selectedStickers.map((sticker) => (
                    <Box
                      key={sticker.id}
                      component="img"
                      src={sticker.sticker}
                      sx={{
                        position: "absolute",
                        left: sticker.x,
                        top: sticker.y,
                        width: `${sticker.width}px`,
                        height: `${sticker.height}px`,
                        objectFit: "contain",
                        zIndex: sticker.zIndex,
                        transform: `rotate(${sticker.rotation || 0}deg)`,
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                </Box>
              </div>
            </div>
            <div className="back">
              <div id="b1" className="back-content">
                {/* Spread 2ndSlide */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  {/* 🎵 / 🎥 QR codes */}
                  {/* {selectedVideoUrl && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: qrPosition.x,
                        top: qrPosition.y,
                        width: qrPosition.width,
                        height: qrPosition.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <QrGenerator
                        url={qrPosition.url || selectedVideoUrl}
                        style={{ width: "100%", height: "100%" }}
                        size={Math.min(qrPosition.width, qrPosition.height)}
                      />
                    </Box>
                  )} */}

                  {/* 🎵 / 🎥 QR codes */}
                  {/* {selectedAudioUrl && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: qrAudioPosition.x,
                        top: qrAudioPosition.y,
                        width: qrAudioPosition.width,
                        height: qrAudioPosition.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <QrGenerator
                        url={qrAudioPosition.url || selectedAudioUrl}
                        style={{ width: "100%", height: "100%" }}
                        size={Math.min(
                          qrAudioPosition.width,
                          qrAudioPosition.height
                        )}
                      />
                    </Box>
                  )} */}

                  {selectedVideoUrl && (
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        // height: "100%",
                        top: qrPosition.y,
                        height: qrPosition.height,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/QR-tips.jpg"
                        sx={{
                          width: "100%",
                          height: 200,
                          position: "relative",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 46,
                          height: 100,
                          width: 100,
                          borderRadius: 2,
                          ml: "10px",
                          // bgcolor:'red',
                          p: 1,
                        }}
                      >
                        <QrGenerator
                          url={qrPosition.url || selectedVideoUrl}
                          size={Math.min(qrPosition.width, qrPosition.height)}
                        />
                      </Box>
                    </Box>
                  )}

                  {selectedAudioUrl && (
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        // height: "100%",
                        top: qrAudioPosition.y,
                        height: qrAudioPosition.height,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/QR-tips.jpg"
                        sx={{
                          width: "100%",
                          height: 200,
                          position: "relative",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 46,
                          height: 100,
                          width: 100,
                          borderRadius: 2,
                          ml: "10px",
                          // bgcolor:'red',
                          p: 1,
                        }}
                      >
                        <QrGenerator
                          url={qrAudioPosition1.url || selectedAudioUrl}
                          size={Math.min(
                            qrAudioPosition.width,
                            qrAudioPosition.height
                          )}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* 🖼️ Only selected images */}
                  {draggableImages
                    .filter((img: any) => selectedImg?.includes(img.id))
                    .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((img: any) => (
                      <Box
                        key={img.id}
                        component="img"
                        src={img.src}
                        sx={{
                          position: "absolute",
                          width: img.width,
                          height: img.height,
                          left: img.x,
                          top: img.y,
                          transform: `rotate(${img.rotation}deg)`,
                          borderRadius: 2,
                          // objectFit: "cover",
                          zIndex: img.zIndex || 1,
                        }}
                      />
                    ))}

                  {multipleTextValue &&
                    texts.map((e) => (
                      <Box
                        key={e}
                        sx={{
                          position: "relative",
                          height: "160px",
                          width: "100%",
                          mb: 2,
                          display: "flex",
                          justifyContent:
                            e.verticalAlign === "top"
                              ? "flex-start"
                              : e.verticalAlign === "center"
                              ? "center"
                              : "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            fontSize: e.fontSize,
                            fontWeight: e.fontWeight,
                            color: e.fontColor,
                            fontFamily: e.fontFamily,
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                            whiteSpace: "pre-line",
                            // border: "3px dashed #3a7bd5",
                            borderRadius: "6px",
                            width: "100%",
                            height: "80%",
                            dipslay: "flex",
                            alignItems: "center",
                            m: "auto",
                            justifyContent:
                              e.verticalAlign === "top"
                                ? "flex-start"
                                : e.verticalAlign === "center"
                                ? "center"
                                : "flex-end",
                            p: 1,
                          }}
                        >
                          {e.value || "Add Text"}
                        </Typography>
                      </Box>
                    ))}

                  {/* 📝 Single Text Layout */}
                  {selectedLayout === "oneText" && (
                    <Box
                      sx={{
                        // position: "absolute",
                        display: "flex",
                        alignItems:
                          verticalAlign === "top"
                            ? "flex-start"
                            : verticalAlign === "center"
                            ? "center"
                            : "flex-end",
                        justifyContent:
                          verticalAlign === "top"
                            ? "flex-start"
                            : verticalAlign === "center"
                            ? "center"
                            : "flex-end",
                        height: "100%",
                        color: fontColor,
                        fontFamily,
                        fontSize,
                        fontWeight,
                        textAlign,
                        whiteSpace: "pre-wrap",
                        width: "100%",
                      }}
                    >
                      {oneTextValue}
                    </Box>
                  )}

                  {textElements &&
                    textElements.map((e) => (
                      <Typography
                        key={e.id}
                        sx={{
                          border: "1px dashed blue",
                          fontSize: e.fontSize,
                          color: e.fontColor,
                          fontFamily: e.fontFamily,
                          fontWeight: e.fontWeight,
                          textAlign: e.textAlign || "center",
                          position: "absolute", // Use absolute positioning
                          left: e.position.x, // X position
                          top: e.position.y, // Y position
                          width: e.size.width, // Width from size object
                          height: "auto", // Height from size object
                          zIndex: e.zIndex, // Apply zIndex
                          transform: `rotate(${e.rotation}deg)`, // Apply rotation
                          padding: "5px",
                          boxSizing: "border-box",
                        }}
                      >
                        {e.value} {/* Display the text value */}
                      </Typography>
                    ))}

                  {isAIimage2 && (
                    <img
                      src={`${selectedAIimageUrl2}`}
                      alt="AIimage"
                      style={{
                        position: "absolute", // 👈 so it can use top/left
                        left: aimage2.x, // 👈 saved x position
                        top: aimage2.y, // 👈 saved y position
                        width: `${aimage2.width}px`, // 👈 saved width
                        height: `${aimage2.height}px`, // 👈 saved height
                        objectFit: "contain",
                        // zIndex: 10,
                        pointerEvents: "none", // 👈 prevents accidental clicking
                      }}
                    />
                  )}
                  {/* 🧷 Preview Stickers */}
                  {selectedStickers2.map((sticker) => (
                    <Box
                      key={sticker.id}
                      component="img"
                      src={sticker.sticker}
                      sx={{
                        position: "absolute",
                        left: sticker.x, // 👈 position
                        top: sticker.y, // 👈 position
                        width: `${sticker.width}px`, // 👈 width
                        height: `${sticker.height}px`, // 👈 height
                        objectFit: "contain",
                        zIndex: sticker.zIndex,
                        transform: `rotate(${sticker.rotation || 0}deg)`,
                        pointerEvents: "none", // so it can’t be clicked
                      }}
                    />
                  ))}
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
                {/* Spread 3rd Slide */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  {/* 🎵 / 🎥 QR codes */}
                  {/* {selectedVideoUrl3 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: qrPosition3.x,
                        top: qrPosition3.y,
                        width: qrPosition3.width,
                        height: qrPosition3.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: qrPosition.y,
                      }}
                    >
                      <QrGenerator
                        url={qrPosition.url || selectedVideoUrl3}
                        style={{ width: "100%", height: "100%" }}
                        size={Math.min(qrPosition3.width, qrPosition3.height)}
                      />
                    </Box>
                  )} */}

                  {/* 🎵 / 🎥 QR codes */}
                  {/* {selectedAudioUrl3 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: qrAudioPosition3.x,
                        top: qrAudioPosition3.y,
                        width: qrAudioPosition3.width,
                        height: qrAudioPosition3.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <QrGenerator
                        url={qrAudioPosition3.url || selectedAudioUrl3}
                        style={{ width: "100%", height: "100%" }}
                        size={Math.min(
                          qrAudioPosition3.width,
                          qrAudioPosition3.height
                        )}
                      />
                    </Box>
                  )} */}

                  {selectedVideoUrl3 && (
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        top: qrPosition3.y,
                        height: qrPosition3.height,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/QR-tips.jpg"
                        sx={{
                          width: "100%",
                          height: 200,
                          position: "relative",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 46,
                          height: 100,
                          width: 100,
                          borderRadius: 2,
                          ml: "10px",
                          // bgcolor:'red',
                          p: 1,
                        }}
                      >
                        <QrGenerator
                          url={qrPosition3.url || selectedVideoUrl3}
                          size={Math.min(qrPosition3.width, qrPosition3.height)}
                        />
                      </Box>
                    </Box>
                  )}

                  {selectedAudioUrl3 && (
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        // height: "100%",
                        top: qrAudioPosition3.y,
                        height: qrAudioPosition3.height,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/QR-tips.jpg"
                        sx={{
                          width: "100%",
                          height: 200,
                          position: "relative",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 46,
                          height: 100,
                          width: 100,
                          borderRadius: 2,
                          ml: "10px",
                          // bgcolor:'red',
                          p: 1,
                        }}
                      >
                        <QrGenerator
                          url={qrAudioPosition3.url || selectedAudioUrl3}
                          size={Math.min(
                            qrAudioPosition3.width,
                            qrAudioPosition3.height
                          )}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* 🖼️ Only selected images */}
                  {draggableImages3
                    .filter((img: any) => selectedImg3?.includes(img.id))
                    .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((img: any) => (
                      <Box
                        key={img.id}
                        component="img"
                        src={img.src}
                        sx={{
                          position: "absolute",
                          width: img.width,
                          height: img.height,
                          left: img.x,
                          top: img.y,
                          transform: `rotate(${img.rotation}deg)`,
                          borderRadius: 2,
                          // objectFit: "cover",
                          zIndex: img.zIndex || 1,
                        }}
                      />
                    ))}

                  {multipleTextValue3 &&
                    texts3.map((e) => (
                      <Box
                        key={e}
                        sx={{
                          position: "relative",
                          height: "160px",
                          width: "100%",
                          mb: 2,
                          display: "flex",
                          justifyContent:
                            e.verticalAlign3 === "top"
                              ? "flex-start"
                              : e.verticalAlign3 === "center"
                              ? "center"
                              : "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            fontSize: e.fontSize3,
                            fontWeight: e.fontWeight3,
                            color: e.fontColor3,
                            fontFamily: e.fontFamily3,
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                            whiteSpace: "pre-line",
                            // border: "3px dashed #3a7bd5",
                            borderRadius: "6px",
                            width: "100%",
                            height: "80%",
                            dipslay: "flex",
                            alignItems: "center",
                            m: "auto",
                            justifyContent:
                              e.verticalAlign3 === "top"
                                ? "flex-start"
                                : e.verticalAlign3 === "center"
                                ? "center"
                                : "flex-end",
                            p: 1,
                          }}
                        >
                          {e.value || "Add Text"}
                        </Typography>
                      </Box>
                    ))}

                  {/* 📝 Single Text Layout */}
                  {selectedLayout3 === "oneText" && (
                    <Box
                      sx={{
                        // position: "absolute",
                        display: "flex",
                        alignItems:
                          verticalAlign3 === "top"
                            ? "flex-start"
                            : verticalAlign3 === "center"
                            ? "center"
                            : "flex-end",
                        justifyContent:
                          verticalAlign3 === "top"
                            ? "flex-start"
                            : verticalAlign3 === "center"
                            ? "center"
                            : "flex-end",
                        height: "100%",
                        color: fontColor3,
                        fontFamily3,
                        fontSize3,
                        fontWeight3,
                        textAlign3,
                        whiteSpace: "pre-wrap",
                        width: "100%",
                      }}
                    >
                      {oneTextValue3}
                    </Box>
                  )}

                  {/* ✍️ Multiple Text Layout */}
                  {selectedLayout3 === "multipleText" && texts3.length > 0 && (
                    <Box
                      sx={{
                        height: "100%",
                        width: "375px",
                        borderRadius: "6px",
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {texts3.map((textObj: any, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            position: "relative",
                            height: "175px",
                            width: "100%",
                            mb: 2,
                            display: "flex",
                            justifyContent:
                              textObj.verticalAlign3 === "top"
                                ? "flex-start"
                                : textObj.verticalAlign3 === "center"
                                ? "center"
                                : "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              textAlign: "center",
                              fontSize: textObj.fontSize3,
                              fontWeight: textObj.fontWeight3,
                              color: textObj.fontColor3,
                              fontFamily: textObj.fontFamily3,
                              lineHeight: 1.4,
                              wordBreak: "break-word",
                              whiteSpace: "pre-line",
                              border: "3px dashed #3a7bd5",
                              borderRadius: "6px",
                              width: "100%",
                              p: 1,
                            }}
                          >
                            {textObj.value || "Add Text"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {textElements3 &&
                    textElements3.map((e) => (
                      <Typography
                        key={e.id}
                        sx={{
                          border: "1px dashed blue",
                          fontSize: e.fontSize,
                          color: e.fontColor,
                          fontFamily: e.fontFamily,
                          fontWeight: e.fontWeight,
                          textAlign: e.textAlign || "center",
                          position: "absolute", // Use absolute positioning
                          left: e.position.x, // X position
                          top: e.position.y, // Y position
                          width: e.size.width, // Width from size object
                          height: "auto", // Height from size object
                          zIndex: e.zIndex, // Apply zIndex
                          transform: `rotate(${e.rotation}deg)`, // Apply rotation
                          padding: "5px",
                          boxSizing: "border-box",
                        }}
                      >
                        {e.value} {/* Display the text value */}
                      </Typography>
                    ))}

                  {isAIimage3 && (
                    <img
                      src={`${selectedAIimageUrl3}`}
                      alt="AIimage"
                      style={{
                        position: "absolute", // 👈 so it can use top/left
                        left: aimage3.x, // 👈 saved x position
                        top: aimage3.y, // 👈 saved y position
                        width: `${aimage3.width}px`, // 👈 saved width
                        height: `${aimage3.height}px`, // 👈 saved height
                        objectFit: "contain",
                        zIndex: 10,
                        pointerEvents: "none", // 👈 prevents accidental clicking
                      }}
                    />
                  )}

                  {/* 🧷 Preview Stickers */}
                  {selectedStickers3.map((sticker) => (
                    <Box
                      key={sticker.id}
                      component="img"
                      src={sticker.sticker}
                      sx={{
                        position: "absolute",
                        left: sticker.x, // 👈 position
                        top: sticker.y, // 👈 position
                        width: `${sticker.width}px`, // 👈 width
                        height: `${sticker.height}px`, // 👈 height
                        objectFit: "contain",
                        zIndex: sticker.zIndex,
                        transform: `rotate(${sticker.rotation || 0}deg)`,
                        pointerEvents: "none", // so it can’t be clicked
                      }}
                    />
                  ))}
                </Box>
              </div>
            </div>
            <div className="back">
              <div id="b2" className="back-content">
                {/* 4th Last Slide */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  {/* 🎵 / 🎥 QR codes */}
                  {/* {selectedVideoUrl4 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: qrPosition4.x,
                        top: qrPosition4.y,
                        width: qrPosition4.width,
                        height: qrPosition4.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: qrPosition4.y,
                      }}
                    >
                      <QrGenerator
                        url={qrPosition4.url || selectedVideoUrl4}
                        style={{ width: "100%", height: "100%" }}
                        size={Math.min(qrPosition4.width, qrPosition4.height)}
                      />
                    </Box>
                  )} */}

                  {/* 🎵 / 🎥 QR codes */}
                  {/* {selectedAudioUrl4 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: qrAudioPosition4.x,
                        top: qrAudioPosition4.y,
                        width: qrAudioPosition4.width,
                        height: qrAudioPosition4.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <QrGenerator
                        url={qrAudioPosition4.url || selectedAudioUrl4}
                        style={{ width: "100%", height: "100%" }}
                        size={Math.min(
                          qrAudioPosition4.width,
                          qrAudioPosition4.height
                        )}
                      />
                    </Box>
                  )} */}

                  {selectedVideoUrl4 && (
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        // height: "100%",
                        top: qrPosition4.y,
                        height: qrPosition4.height,
                        // bottom: 0,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/QR-tips.jpg"
                        sx={{
                          width: "100%",
                          height: 200,
                          position: "relative",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 46,
                          height: 100,
                          width: 100,
                          borderRadius: 2,
                          ml: "10px",
                          // bgcolor:'red',
                          p: 1,
                        }}
                      >
                        <QrGenerator
                          url={qrPosition4.url || selectedVideoUrl4}
                          size={Math.min(qrPosition4.width, qrPosition4.height)}
                        />
                      </Box>
                    </Box>
                  )}

                  {selectedAudioUrl4 && (
                    <Box
                      sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        m: "auto",
                        width: "100%",
                        textAlign: "center",
                        height: "100%",
                        bottom: 0,
                        flex: 1,
                      }}
                    >
                      <Box
                        component={"img"}
                        src="/assets/images/QR-tips.jpg"
                        sx={{
                          width: "100%",
                          height: 200,
                          position: "relative",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 46,
                          height: 100,
                          width: 100,
                          borderRadius: 2,
                          ml: "10px",
                          // bgcolor:'red',
                          p: 1,
                        }}
                      >
                        <QrGenerator
                          url={qrAudioPosition4.url || selectedAudioUrl4}
                          size={Math.min(
                            qrAudioPosition4.width,
                            qrAudioPosition4.height
                          )}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* 🖼️ Only selected images */}
                  {draggableImages4
                    .filter((img: any) => selectedImg4?.includes(img.id))
                    .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((img: any) => (
                      <Box
                        key={img.id}
                        component="img"
                        src={img.src}
                        sx={{
                          position: "absolute",
                          width: img.width,
                          height: img.height,
                          left: img.x,
                          top: img.y,
                          transform: `rotate(${img.rotation}deg)`,
                          borderRadius: 2,
                          // objectFit: "cover",
                          zIndex: img.zIndex || 1,
                        }}
                      />
                    ))}

                  {multipleTextValue4 &&
                    texts4.map((e) => (
                      <Box
                        key={e}
                        sx={{
                          position: "relative",
                          height: "160px",
                          width: "100%",
                          mb: 2,
                          display: "flex",
                          justifyContent:
                            e.verticalAlign4 === "top"
                              ? "flex-start"
                              : e.verticalAlign4 === "center"
                              ? "center"
                              : "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            fontSize: e.fontSize4,
                            fontWeight: e.fontWeight4,
                            color: e.fontColor4,
                            fontFamily: e.fontFamily4,
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                            whiteSpace: "pre-line",
                            // border: "3px dashed #3a7bd5",
                            borderRadius: "6px",
                            width: "100%",
                            height: "80%",
                            dipslay: "flex",
                            alignItems: "center",
                            m: "auto",
                            justifyContent:
                              e.verticalAlign4 === "top"
                                ? "flex-start"
                                : e.verticalAlign4 === "center"
                                ? "center"
                                : "flex-end",
                            p: 1,
                          }}
                        >
                          {e.value || "Add Text"}
                        </Typography>
                      </Box>
                    ))}

                  {/* 📝 Single Text Layout */}
                  {selectedLayout4 === "oneText" && (
                    <Box
                      sx={{
                        // position: "absolute",
                        display: "flex",
                        alignItems:
                          verticalAlign4 === "top"
                            ? "flex-start"
                            : verticalAlign4 === "center"
                            ? "center"
                            : "flex-end",
                        justifyContent:
                          verticalAlign4 === "top"
                            ? "flex-start"
                            : verticalAlign4 === "center"
                            ? "center"
                            : "flex-end",
                        height: "100%",
                        color: fontColor4,
                        fontFamily4,
                        fontSize4,
                        fontWeight4,
                        textAlign4,
                        whiteSpace: "pre-wrap",
                        width: "100%",
                      }}
                    >
                      {oneTextValue4}
                    </Box>
                  )}

                  {/* ✍️ Multiple Text Layout */}
                  {selectedLayout4 === "multipleText" && texts4.length > 0 && (
                    <Box
                      sx={{
                        height: "100%",
                        width: "375px",
                        borderRadius: "6px",
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {texts4.map((textObj: any, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            position: "relative",
                            height: "175px",
                            width: "100%",
                            mb: 2,
                            display: "flex",
                            justifyContent:
                              textObj.verticalAlign4 === "top"
                                ? "flex-start"
                                : textObj.verticalAlign4 === "center"
                                ? "center"
                                : "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              textAlign: "center",
                              fontSize: textObj.fontSize4,
                              fontWeight: textObj.fontWeight4,
                              color: textObj.fontColor4,
                              fontFamily: textObj.fontFamily4,
                              lineHeight: 1.4,
                              wordBreak: "break-word",
                              whiteSpace: "pre-line",
                              border: "3px dashed #3a7bd5",
                              borderRadius: "6px",
                              width: "100%",
                              p: 1,
                            }}
                          >
                            {textObj.value || "Add Text"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {textElements4 &&
                    textElements4.map((e) => (
                      <Typography
                        key={e.id}
                        sx={{
                          border: "1px dashed blue",
                          fontSize: e.fontSize,
                          color: e.fontColor,
                          fontFamily: e.fontFamily,
                          fontWeight: e.fontWeight,
                          textAlign: e.textAlign || "center",
                          position: "absolute", // Use absolute positioning
                          left: e.position.x, // X position
                          top: e.position.y, // Y position
                          width: e.size.width, // Width from size object
                          height: "auto", // Height from size object
                          zIndex: e.zIndex, // Apply zIndex
                          transform: `rotate(${e.rotation}deg)`, // Apply rotation
                          padding: "5px",
                          boxSizing: "border-box",
                        }}
                      >
                        {e.value} {/* Display the text value */}
                      </Typography>
                    ))}

                  {isAIimage4 && (
                    <img
                      src={`${selectedAIimageUrl4}`}
                      alt="AIimage"
                      style={{
                        position: "absolute", // 👈 so it can use top/left
                        left: aimage4.x, // 👈 saved x position
                        top: aimage4.y, // 👈 saved y position
                        width: `${aimage4.width}px`, // 👈 saved width
                        height: `${aimage4.height}px`, // 👈 saved height
                        objectFit: "contain",
                        zIndex: 10,
                        pointerEvents: "none", // 👈 prevents accidental clicking
                      }}
                    />
                  )}

                  {/* 🧷 Preview Stickers */}
                  {selectedStickers4.map((sticker) => (
                    <Box
                      key={sticker.id}
                      component="img"
                      src={sticker.sticker}
                      sx={{
                        position: "absolute",
                        left: sticker.x, // 👈 position
                        top: sticker.y, // 👈 position
                        width: `${sticker.width}px`, // 👈 width
                        height: `${sticker.height}px`, // 👈 height
                        objectFit: "contain",
                        zIndex: sticker.zIndex,
                        transform: `rotate(${sticker.rotation || 0}deg)`, // rotaion for sticker
                        pointerEvents: "none", // so it can’t be clicked
                      }}
                    />
                  ))}
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
      <GlobalWatermark />
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
