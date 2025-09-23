import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import PopupWrapper from "../PopupWrapper/PopupWrapper";
import { useState } from "react";
import { Send } from "@mui/icons-material";

interface GeneAIType {
  onClose: () => void;
}

// const OPEN_AI_KEY =
//   "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";

const GeneAIPopup = (props: GeneAIType) => {
  const { onClose } = props;
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);

  // fake "typing effect"
  const animateText = (text: string) => {
    let i = 0;
    setGeneratedText("");
    const interval = setInterval(() => {
      setGeneratedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 40); // speed (ms per char)
  };

  //  const handleSubmit = async () => {
  //   if (!prompt.trim()) return;
  //   setLoading(true);
  //   setGeneratedText("");

  //   try {
  //     const res = await fetch("https://api.openai.com/v1/chat/completions", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${OPEN_AI_KEY}`,
  //       },
  //       body: JSON.stringify({
  //         model: "gpt-4o-mini",
  //         messages: [{ role: "user", content: `Write a greeting card: ${prompt}` }],
  //       }),
  //     });

  //     const data = await res.json();
  //     console.log("OpenAI response:", data);

  //     if (data.error) {
  //       setGeneratedText("❌ " + data.error.message);
  //       return;
  //     }

  //     const text = data.choices[0].message.content;
  //     animateText(text);
  //   } catch (err) {
  //     console.error("Error:", err);
  //     setGeneratedText("❌ Failed to generate card.");
  //   } finally {
  //     setLoading(false);
  //     setPrompt("");
  //   }
  // };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedText("");

    // Fake AI response for demo
    setTimeout(() => {
      const text = `🎉 Greeting Card\n\n"${prompt}" sounds amazing! Wishing you happiness and success.Do you also want me to update it so that it can switch between fake/demo mode and real API call (DeepSeek or OpenAI) with a toggle`;
      animateText(text);
      setLoading(false);
      setPrompt("");
    }, 1500);
  };

  return (
    <PopupWrapper
      title="Generate AI"
      onClose={onClose}
      sx={{ width: 280, height: 600, left: "3%" }}
    >
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
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          multiline
        />
        <IconButton
          sx={{
            position: "absolute",
            right: 5,
            border: "1px solid #212121",
            bgcolor: "#212121",
            color: "white",
          }}
          onClick={handleSubmit}
        >
          <Send />
        </IconButton>
      </Box>
    </PopupWrapper>
  );
};

export default GeneAIPopup;
