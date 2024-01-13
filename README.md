# stripe-mailgun-fulfillment
Simple listener service to get completed orders for digital items from Stripe and send them out via mailgun.

# Setup
1. Create config.json file (for local testing)

2. In production, it's better to add environment variables directly.

# Using this repo
1. Install and run Stripe CLI, only including the events required:
```
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed \
--forward-to localhost:{YOUR_PORT_HERE}/webhook
```
This allows stripe to send information to this node app.

2. If not already present, copy in the webhook from the CLI into `config.json`

3. Update other values in the `config.json` file, the sample includes descriptions of each field

4. Run `npm ci` in your desired server (if you're just testing it, run `npm run dev`)

5. `test.rest` contains API tests, formatted for VS Code IDE using the Rest Client extension by Huachao Mao. It's easy to test failure cases but I've found it more convenient to just trigger required actions from the Stripe dev page.

# Hat tip
- [Stripe official documentation](https://stripe.com/docs/payments/checkout/fulfill-orders)
- [Full Stack Open](https://fullstackopen.com/en/)