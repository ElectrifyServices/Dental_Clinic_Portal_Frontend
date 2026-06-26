import QRCode from "qrcode";

const url = "https://opalsmiles.com/";

QRCode.toFile(
    "opalsmiles-qr.png",
    url,
    {
        width: 500,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#FFFFFF",
        },
    },
    (err) => {
        if (err) {
            console.error("Error generating QR Code:", err);
            return;
        }
    }
);