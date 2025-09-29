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
            currency: "usd", // or "gbp" if you want £
            product_data: { name: title },
            unit_amount: price * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:5173/success-payment",
      cancel_url: "http://localhost:5173/subscription",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// 🔒 Canva OAuth Redirect Handler
// app.get("/oauth/redirect", async (req, res) => {
//     const { code } = req.query;

//     if (!code) {
//         return res.status(400).send('Authorization code missing.');
//     }

//     try {
//         const tokenResponse = await axios.post(
//             'https://api.canva.com/rest/v1/oauth/token',
//             {
//                 grant_type: 'authorization_code',
//                 client_id: 'OC-AZlxEPWNVvd4',
//                 client_secret: 'cnvca349948jygH1Jbe1WDAjMoWjvWPk5CcVUgBfDJkC1IVc65dfa911',
//                 redirect_uri: 'http://localhost:5000/oauth/redirect',
//                 code: code,
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

//         const { access_token, refresh_token } = tokenResponse.data;
//         // In a real app, you would securely store these tokens in a database
//         // and link them to the user session. For this example, we'll send them to the client.
//        res.redirect(`https://ecomm-editor-shahimad499-2660-imads-projects-8cd60545.vercel.app/home?access_token=${access_token}`);
//     } catch (error) {
//         console.error("Error exchanging code for token:", error.response ? error.response.data : error.message);
//         res.status(500).send("Authentication failed.");
//     }
// });

// 🎨 Route to generate a new card design from a prompt
// app.post("/create-canva-design", async (req, res) => {
//     const { accessToken, prompt } = req.body;

//     if (!accessToken || !prompt) {
//         return res.status(400).send('Missing access token or prompt.');
//     }

//     try {
//         const designResponse = await axios.post(
//             'https://api.canva.com/rest/v1/designs',
//             {
//                 title: prompt,
//                 design_type: {
//                     type: "preset",
//                     name: "card"
//                 },
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

//         res.json(designResponse.data);
//     } catch (error) {
//         console.error("Error creating Canva design:", error.response ? error.response.data : error.message);
//         res.status(500).send("Failed to create Canva design.");
//     }
// });




app.listen(5000, () => console.log("Server running on port 5000"));