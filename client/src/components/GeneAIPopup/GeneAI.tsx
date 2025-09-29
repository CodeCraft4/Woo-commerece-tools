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
  // const params = new URLSearchParams({
  //   client_id: import.meta.env.VITE_CANVA_CLIENT_ID, 
  //   response_type: 'code',
  //   redirect_uri: import.meta.env.VITE_CANVA_REDIRECT_URI, 
  //   scope: 'design:content:read design:content:write', 
  //   state: 'random_string_for_security',
  // });
  // window.location.href = `https://www.canva.com/api/oauth/authorize?${params.toString()}`;
  window.location.href = `https://www.canva.com/api/oauth/authorize?code_challenge_method=s256&response_type=code&client_id=OC-AZlxEPWNVvd4&redirect_uri=https%3A%2F%2Fecomm-editor-shahimad499-2660-imads-projects-8cd60545.vercel.app%2Fhome&scope=design:permission:read%20folder:permission:write%20design:permission:write%20app:write%20comment:read%20profile:read%20app:read%20brandtemplate:meta:read%20design:content:write%20folder:write%20asset:read%20design:content:read%20design:meta:read%20folder:read%20asset:write%20brandtemplate:content:read%20folder:permission:read%20comment:write&code_challenge=`;
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
      sx={{ width: 300, height: 600, left: "12%" }}
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