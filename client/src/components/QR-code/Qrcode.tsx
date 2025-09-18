// QrGenerator.tsx
import { QRCodeSVG } from "qrcode.react";

type QrGeneratorProps = {
  url: string;
};

const QrGenerator = ({ url }: QrGeneratorProps) => {
  return (
    <div style={{ textAlign: "center" }}>
      <QRCodeSVG
        value={url}
        size={80}
        style={{ marginLeft: "280px", marginTop: "10px" }}
      />
    </div>
  );
};

export default QrGenerator;
