import express from "express";
import Stripe from "stripe";
import cors from "cors";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

// Stripe secret key
const stripe = new Stripe(
  "sk_test_51Qy8qWQOrHBOHXVwnCXKHV8Gn7YC5gCHDcNHIofLAcwOACPIT9u0NzPp98WYPwKxhlsyqIick2jxwEoMhzmSsjzi00fLOBTyAB"
);

// ----------------------------------------------------------------------
// 1️⃣ CREATE CHECKOUT SESSION
// ----------------------------------------------------------------------
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { title, price, user } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user?.email,
      metadata: { userName: user?.name },
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: title },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      success_url:
        "http://localhost:5173/success-payment?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/subscription",
    });

    return res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------
// 2️⃣ SEND PDF AFTER SUCCESS (NO WEBHOOK)
// ----------------------------------------------------------------------
app.post("/send-pdf-after-success", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID missing" });
    }

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const userEmail = session.customer_email;
    const userName = session.metadata?.userName || "Customer";

    // Generate PDF
    const pdfBuffer = await generatePDF(userName);

    // Send PDF
    await sendEmailWithPDF(userEmail, pdfBuffer);

    console.log("📧 PDF sent to:", userEmail);

    res.json({ success: true });
  } catch (err) {
    console.error("PDF EMAIL ERROR:", err);
    res.status(500).json({ error: "Failed to send PDF" });
  }
});

// ----------------------------------------------------------------------
// PDF Generator
// ----------------------------------------------------------------------
function generatePDF(userName) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(22).text(`Hello ${userName},`);
    doc.moveDown();
    doc.fontSize(18).text(
      "Thank you so much for using the DIY Personalisation Card!"
    );

    doc.end();
  });
}

// ----------------------------------------------------------------------
// Email Sender
// ----------------------------------------------------------------------
async function sendEmailWithPDF(email, pdfBuffer) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "imaddev4@gmail.com",       
      pass: "rcxy oudk jfdj kake",    
    },
  });

  await transporter.sendMail({
    from: "DIY Cards <imaddev4@gmail.com>",
    to: email,
    subject: "Your DIY Personalisation Card PDF",
    text: "Your personalised card PDF is attached. ❤️",
    attachments: [
      {
        filename: "personalised-card.pdf",
        content: pdfBuffer,
      },
    ],
  });
}

// ----------------------------------------------------------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
