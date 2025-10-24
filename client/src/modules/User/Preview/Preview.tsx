import { Box, Button, Typography } from "@mui/material";
import Applayout from "../../../layout/Applayout";
import PreviewBookCard from "../../../components/PreviewCards/PreviewCards";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../constant/route";

const Preview = () => {

  const navigate = useNavigate()

  // const [downloadModal, setDownloadModal] = useState(false);
  // Printing function
  // const handlePrintCard = () => {
  //   window.print();
  // };

  //   Download Function

  return (
    <Applayout>
      <Box sx={{ height: "80vh"}}>

        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between",p:2 }}>
          <Typography sx={{ fontSize: "30px", fontFamily: "cursive" }}>
            Preview
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            {/* <Button
              variant="outlined"
              color="warning"
              onClick={handlePrintCard}
            >
              Print
            </Button> */}
            <Button
              variant="contained"
              // onClick={() => setDownloadModal(!downloadModal)}
              onClick={()=>navigate(USER_ROUTES.SUBSCRIPTION)}
            >
              Download
            </Button>
          </Box>
        </Box>

        <PreviewBookCard/>


        {/* {downloadModal && (
          <DownloadModal
            open={downloadModal}
            onCloseModal={() => setDownloadModal(false)}
          />
        )} */}
      </Box>{" "}
    </Applayout>
  );
};

export default Preview;
