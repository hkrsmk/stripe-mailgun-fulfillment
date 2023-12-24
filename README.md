# stripe-mailgun-fulfillment
Simple listener service to get completed orders for digital items from Stripe and send them out via mailgun.

# Setup
1. Create .env file (for local testing)
2. In production, use something like `VARIABLE=test npm start` to add environment variables.

# Using this repo
1. Run `npm ci`
2. If you're just testing it, run `npm run dev`
3. Run Stripe CLI, only including the events required:
```
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed \
--forward-to localhost:{YOUR_PORT_HERE}/webhook
```
4. `test.rest` contains API tests, formatted for VS Code IDE using the Rest Client extension by Huachao Mao. It's easy to test failure cases but I've found it more convenient to just trigger required actions from the Stripe dev page.

# Hat tip
- [Stripe official documentation](https://stripe.com/docs/payments/checkout/fulfill-orders)
- [Full Stack Open](https://fullstackopen.com/en/)