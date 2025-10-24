import { QRCodeSVG } from "qrcode.react";

type QrGeneratorProps = {
  url: string | any;
  size?: number;
  style?: React.CSSProperties;
};

const QrGenerator = ({ url, style, size }: QrGeneratorProps) => {
  return (
    <div style={style}>
      <QRCodeSVG value={url} size={size} />
    </div>
  );
};

export default QrGenerator;
