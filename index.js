const express = require("express");
require("./db/index.js");
const authRouter = require("./routes/auth.js");
// const stripeRouter = require("./routes/stripe.js");
const cors = require("cors");
const UserModel = require("./models/user.js");
const Order = require("./models/order.js");
const stripe = require("stripe")(
  "sk_test_51P3HfZSIOfadBdWaYyVJCvhFKNZjySjX8Qz8oPNOxkEuFSYX9ubjruAlL8OOnw6TYY6tLNV4I2bjyaVj054Mv9Ck00TTUDh3kb"
);

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
// app.use("/stripe", stripeRouter);

app.get("/", (req, res) => {
  res.json({ shop: "mahinelectrical" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});

// Endpoint to store a new address
app.post("/addaddress", async (req, res) => {
  console.log("adding address");
  try {
    const { userId, address } = req.body;
    // find user by the userId
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    // add new address to users address array
    user.address.push(address);
    user.save();
    res.status(200).json({ message: "address added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error Adding Address" });
  }
});

//Endpoint to get all addresses of the user
app.get("/addresses/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const addresses = user.address;
    res.status(200).json({ message: "ok", addresses });
  } catch (error) {
    res.status(500).json({ message: "Error getting User Addresses" });
  }
});

//Endpoint To Store All The Orders
app.post("/placeorder", async (req, res) => {
  try {
    const { userId, cartItems, totalPrice, shippingAddress, paymentMethod } =
      req.body;
    console.log("userId: " + userId);
    console.log("cartItems: " + cartItems);
    console.log("totalPrice: " + totalPrice);
    console.log("shippingAddress: " + shippingAddress);
    console.log("paymentMethod: " + paymentMethod);
    const user = await UserModel.findById(userId);
    if (!user) {
      console.log("user not found");
      return res.status(404).json({ message: "user not found" });
    }
    // create array of products from cart items
    const products = cartItems.map((item) => ({
      name: item?.title,
      quantity: item?.quantity,
      price: item?.newPrice,
      image: item?.image,
    }));
    console.log("product: " + products);

    // create new order
    const order = new Order({
      user: userId,
      products: products,
      totalPrice: totalPrice,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
    });
    console.log("placed order: " + order);
    await order.save();
    res.status(200).json({ message: "Order Created Successfully!!!" });
  } catch (error) {
    res.status(500).json({ message: "Error creating order" });
  }
});

//get users orders
app.get("/orders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ user: userId }).populate("user");
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No Orders Found For This User" });
    }
    res.status(200).json({ message: "your Order", order: orders });
  } catch (error) {
    res.status(500).json({ message: "Error getting users orders" });
  }
});
//stripe paymentsheet
app.post("/payment-sheet", async (req, res) => {
  // Get product amount and currency from the request body
  const { amount, currency, userId, selectedAddress } = req.body;
  console.log(
    "amount: " + amount + " currency: " + currency + " userId: " + userId
  );
  // check customerId
  const user = await UserModel.findById(userId);
  if (!user) {
    console.log("user not found");
    return res.status(404).json({ message: "user not found" });
  }
  if (user.customerId) {
    console.log("customerId is set to " + user.customerId);
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: user.customerId },
      { apiVersion: "2023-10-16" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.customerId,
      setup_future_usage: "off_session",
      description: "ecommerce pay",
      // description: 'Software development services',
      shipping: {
        name: selectedAddress?.name,
        address: {
          line1: `${selectedAddress?.houseNo},${selectedAddress?.street}`,
          postal_code: selectedAddress?.postalCode,
          city: selectedAddress?.city,
          state: selectedAddress?.state,
          country: selectedAddress?.country,
        },
      },
      payment_method_types: ["card"],
      payment_method_options: {
        card: {
          // Set 3D Secure to "optional" or "automatic" to avoid requiring 3D Secure authentication
          three_d_secure: "optional",
        },
      },
    });
    // Return the paymentIntent to the client
    return res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: user.customerId,
      publishableKey:
        "pk_test_51P3HfZSIOfadBdWaO7w2Fs0Zo49SwMd929OMWKFnTLtngJkZ9MZQ0kFgBrAG3r5pPWD0aOTLxLCWr5aQxyvYrz2E00WajNJ0gp",
    });
  }
  console.log("customerId not found");
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create({
    name: selectedAddress?.name,
    address: {
      line1: `${selectedAddress?.houseNo},${selectedAddress?.street}`,
      postal_code: selectedAddress?.postalCode,
      city: selectedAddress?.city,
      state: selectedAddress?.state,
      country: selectedAddress?.country,
    },
  });
  // save customerId to database
  user.customerId = customer.id;
  await user.save();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2023-10-16" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: user.customerId,
    setup_future_usage: "off_session",
    description: "ecommerce pay",
    // description: 'Software development services',
    shipping: {
      name: selectedAddress?.name,
      address: {
        line1: `${selectedAddress?.houseNo},${selectedAddress?.street}`,
        postal_code: selectedAddress?.postalCode,
        city: selectedAddress?.city,
        state: selectedAddress?.state,
        country: selectedAddress?.country,
      },
    },
    amount: 1099,
    currency: "usd",
    payment_method_types: ["card"],
    payment_method_options: {
      card: {
        // Set 3D Secure to "optional" or "automatic" to avoid requiring 3D Secure authentication
        three_d_secure: "optional",
      },
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey:
      "pk_test_51P3HfZSIOfadBdWaO7w2Fs0Zo49SwMd929OMWKFnTLtngJkZ9MZQ0kFgBrAG3r5pPWD0aOTLxLCWr5aQxyvYrz2E00WajNJ0gp",
  });
});
