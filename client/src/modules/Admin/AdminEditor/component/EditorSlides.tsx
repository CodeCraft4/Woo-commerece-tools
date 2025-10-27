import { Box } from "@mui/material";
import FirstSlide from "./FirstSlide/FirstSlide";
import MainSlide from "./MainSlide/MainSlide";
import LastSlide from "./LastSlide/LastSlide";
import Slider from "react-slick";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";

const EditorSlides = () => {
  const [firstSlide, setFirstSlide] = useState("");

  const location = useLocation();

  // Log the form data when the component mounts
  useEffect(() => {
    const data = location.state.formData;
    if (location.state?.formData) {
      setFirstSlide(data);
    } else {
      console.log("No edit design data received.");
    }
  }, [location.state]);

  var settings = {
    dots: false,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false, 
    pauseOnHover: false, 
    pauseOnFocus: false, 
    swipe: false, 
    draggable: false, 
    arrows: true,
    prevArrow: (
      <Box
        sx={{
          width: 50,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 50,
          borderRadius: 50,
          zIndex: 2,
        }}
        aria-label="previous"
      >
        <ArrowBackIosNew sx={{ fontSize: 50, color: "black" }} />
      </Box>
    ),
    nextArrow: (
      <Box
        sx={{
          width: 50,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 50,
          borderRadius: 50,
          zIndex: 2,
          right: 3,
        }}
        aria-label="next"
      >
        <ArrowForwardIos sx={{ fontSize: 50, color: "black" }} />
      </Box>
    ),
      responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Box>
      <Slider {...settings}>
        <FirstSlide firstSlide={firstSlide} />
        <MainSlide />
        <LastSlide />
      </Slider>
    </Box>
  );
};

export default EditorSlides;
