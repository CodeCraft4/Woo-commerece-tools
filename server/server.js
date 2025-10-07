import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();

// ✅ Create Stripe instance with proper types
const stripe = new Stripe("sk_test_51Qy8qWQOrHBOHXVwnCXKHV8Gn7YC5gCHDcNHIofLAcwOACPIT9u0NzPp98WYPwKxhlsyqIick2jxwEoMhzmSsjzi00fLOBTyAB");

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Route: Create Checkout Session
app.post(
  "/create-checkout-session",
  async (req , res) => {
    try {
      const { title, price } = req.body;

      if (!title || !price) {
        return res.status(400).json({ error: "Missing title or price" });
      }

      // ✅ Type-safe Stripe session creation
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: { name: title },
              unit_amount: price * 100, // Stripe expects smallest currency unit
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:5173/success-payment",
        cancel_url: "http://localhost:5173/subscription",
      });

      return res.json({ id: session.id });
    } catch (err) {
      if (err instanceof Error) {
        console.error("Stripe error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      console.error("Unknown error:", err);
      return res.status(500).json({ error: "An unknown error occurred" });
    }
  }
);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
