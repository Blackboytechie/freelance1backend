// const express  = require("express");
// const stripeRouter = express.Router();

// const stripe = require('stripe')('sk_test_51P3HfZSIOfadBdWaYyVJCvhFKNZjySjX8Qz8oPNOxkEuFSYX9ubjruAlL8OOnw6TYY6tLNV4I2bjyaVj054Mv9Ck00TTUDh3kb');
// // This example sets up an endpoint using the Express framework.
// // Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.

// stripeRouter.post('/payment-sheet', async (req, res) => {
//   // Use an existing Customer ID if this is a returning customer.
//   const customer = await stripe.customers.create();
//   const ephemeralKey = await stripe.ephemeralKeys.create(
//     {customer: customer.id},
//     {apiVersion: '2023-10-16'}
//   );
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: 1099,
//     currency: 'eur',
//     customer: customer.id,
//     // In the latest version of the API, specifying the `automatic_payment_methods` parameter
//     // is optional because Stripe enables its functionality by default.
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });

//   res.json({
//     paymentIntent: paymentIntent.client_secret,
//     ephemeralKey: ephemeralKey.secret,
//     customer: customer.id,
//     publishableKey: 'pk_test_51P3HfZSIOfadBdWaO7w2Fs0Zo49SwMd929OMWKFnTLtngJkZ9MZQ0kFgBrAG3r5pPWD0aOTLxLCWr5aQxyvYrz2E00WajNJ0gp'
//   });
// });