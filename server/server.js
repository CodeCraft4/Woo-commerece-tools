import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
const stripe = new Stripe("sk_test_51Qy8qWQOrHBOHXVwnCXKHV8Gn7YC5gCHDcNHIofLAcwOACPIT9u0NzPp98WYPwKxhlsyqIick2jxwEoMhzmSsjzi00fLOBTyAB"); // 🔑

app.use(cors());
app.use(express.json());

// ✅ Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { title, price } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: title },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "localhost:5173/success-payment",
      cancel_url: "localhost:5173/subscription",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
