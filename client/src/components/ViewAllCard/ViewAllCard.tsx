import { useState } from "react";
import { Box } from "@mui/material";
import { COLORS } from "../../constant/color";
import { SwapVert, TuneOutlined } from "@mui/icons-material";
import { CATEGORIES_DATA } from "../../constant/data";

const tabs = ["View All Filters", "For Her", "For Him", "For Kids"];
const ViewAllCard = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const filteredData =
    activeTab === "View All Filters"
      ? CATEGORIES_DATA
      : CATEGORIES_DATA.filter((e) => e.category === activeTab);

  return (
    <Box>
      <Box
        sx={{
          mt: { md: 8 },
          display: "flex",
          gap: "14px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: { md: "flex", sm: "flex", xs: "none" },
            alignItems: "center",
            gap: "5px",
          }}
        >
          {tabs.map((e) => (
            <Box
              component={"div"}
              onClick={() => setActiveTab(e)}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 20,
                bgcolor: activeTab === e ? COLORS.primary : "transparent",
                color: activeTab === e ? COLORS.white : COLORS.primary,
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              {e === "View All Filters" && (
                <TuneOutlined
                  sx={{
                    color: activeTab === e ? COLORS.white : COLORS.primary,
                  }}
                />
              )}{" "}
              {e}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: { md: "flex", sm: "flex", xs: "none" },
            alignItems: "center",
            gap: "3px",
            border: "1px solid black",
            borderRadius: 20,
            px: 2,
            py: 1,
            cursor: "pointer",
            "&:hover": {
              bgcolor: "lightGray",
            },
          }}
        >
          <SwapVert />
          Sort
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent:{md:'auto',sm:'auto',xs:'center'},
          gap: "21px",
          mt: { md: 4, sm: 4, xs: 0 },
        }}
      >
        {filteredData.length > 0 ? (
          filteredData.map((e) => (
            <Box
              key={e.id}
              component={"img"}
              src={e.poster}
              sx={{
                width: 255,
                height: 350,
                objectFit: "cover",
                borderRadius: 2,
                border: "2px solid lightGray",
              }}
            />
          ))
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: 200,
              fontSize: "20px",
              fontWeight: 500,
              color: "gray",
            }}
          >
            Product not found
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ViewAllCard;
