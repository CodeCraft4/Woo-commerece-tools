import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Card,
  CardContent,
  Button
} from "@mui/material";
import PopupWrapper from "../PopupWrapper/PopupWrapper";
import { useState, useEffect } from "react";
import { Send } from "@mui/icons-material";
import axios from "axios";

interface GeneAIType {
  onClose: () => void;
}

const GeneAIPopup = (props: GeneAIType) => {
  const { onClose } = props;
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [canvaAccessToken, setCanvaAccessToken] = useState("");
  const [designUrl, setDesignUrl] = useState("");

  useEffect(() => {
    // Check for access token in the URL after OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    if (accessToken) {
      setCanvaAccessToken(accessToken);
      // Clean the URL to hide the token
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCanvaLogin = () => {
  const params = new URLSearchParams({
    client_id: 'OC-AZlxEPWNVvd4', 
    response_type: 'code',
    redirect_uri:"http://localhost:5000/oauth/redirect", 
    scope: 'design:content:read design:content:write',
    state: 'random_string_for_security',
  });
  console.log(params,'--')
  window.location.href = `https://www.canva.com/api/oauth/authorize?${params.toString()}`;
};

  const handleGenerateDesign = async () => {
    if (!prompt.trim() || !canvaAccessToken) return;
    setLoading(true);
    setGeneratedText("");
    setDesignUrl("");

    try {
      const res = await axios.post("http://localhost:5000/create-canva-design", {
        accessToken: canvaAccessToken,
        prompt: prompt,
      });

      const designId = res.data.id;
      const url = `https://www.canva.com/design/${designId}/edit`;
      
      setDesignUrl(url);
      animateText(`✅ Your card design has been created! Click the button below to edit it in Canva.`);
    } catch (err) {
      console.error("Error generating Canva design:", err);
      setGeneratedText("❌ Failed to generate card design.");
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  const animateText = (text: string) => {
    let i = 0;
    setGeneratedText("");
    const interval = setInterval(() => {
      setGeneratedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 40);
  };

  return (
    <PopupWrapper
      title="Generate AI"
      onClose={onClose}
      sx={{ width: 280, height: 600, left: "3%" }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!canvaAccessToken ? (
          <Button variant="contained" onClick={handleCanvaLogin}>
            Login to Canva
          </Button>
        ) : (
          <Typography>✨ You are connected to Canva!</Typography>
        )}
      </Box>

      <Box
        sx={{
          height: 430,
          border: "2px solid #acc9c9ff",
          borderRadius: 2,
          width: "100%",
          overflowY: "auto",
          p: 2,
        }}
      >
        {/* AI Response Card */}
        {generatedText && (
          <Card sx={{ bgcolor: "#fefefe", mb: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {generatedText}
              </Typography>
            </CardContent>
          </Card>
        )}

        {designUrl && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" href={designUrl} target="_blank">
              Edit in Canva
            </Button>
          </Box>
        )}

        {loading && <Typography>✍️ Writing your card...</Typography>}
      </Box>

      {/* Input + Submit */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: 2,
          bgcolor: "#ebf7f7ff",
          position: "relative",
          mt: 1,
        }}
      >
        <InputBase
          placeholder="Write your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          sx={{ p: 1, width: "90%" }}
          onKeyDown={(e) => e.key === "Enter" && handleGenerateDesign()}
          multiline
          disabled={!canvaAccessToken || loading}
        />
        <IconButton
          sx={{
            position: "absolute",
            right: 5,
            border: "1px solid #212121",
            bgcolor: "#212121",
            color: "white",
          }}
          onClick={handleGenerateDesign}
          disabled={!canvaAccessToken || loading}
        >
          <Send />
        </IconButton>
      </Box>
    </PopupWrapper>
  );
};

export default GeneAIPopup;