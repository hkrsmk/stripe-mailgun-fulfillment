// change this out to your actual .env file.
// a better way to handle secrets is probably with a dedicated secrets manager.
// or, put it into the environment directly
require('dotenv').config({ path: './.env_sample' })

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
// you need to change out the public stripe key for your own one, if not you will have this error
// error: No such checkout.session
const stripe = require('stripe')(process.env.STRIPE_TEST_KEY)

// Find your endpoint's secret in your Dashboard's webhook settings
const endpointSecret = process.env.WEBHOOK_SIGNING_SECRET

const port = process.env.PORT

// Using Express
const app = require('express')()

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser')

console.log(process.env.VARIABLE)

const fulfillOrder = async (session) => {
    // TODO: fill me in
    try{
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      )

      console.log("Fulfilling order", lineItems)
      return

    } catch (err) {
        console.log(err)
        throw err
    }
  }

const createOrder = (session) => {
// TODO: fill me in
console.log("Creating order", session)
}

const emailCustomerAboutFailedPayment = (session) => {
// TODO: fill me in
console.log("Emailing customer", session)
}

app.post('/webhook', bodyParser.raw({type: 'application/json'}), async (request, response) => {
    const payload = request.body
    const sig = request.headers['stripe-signature']
  
    let event
  
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret)
    } catch (err) {
      return response.status(400).send(`Webhook Error: ${err.message}`)
    }

    try {
        // Handle the checkout.session.completed event
        switch (event.type) {
            case 'checkout.session.completed': {
              const session = event.data.object

              // Save an order in your database, marked as 'awaiting payment'
              createOrder(session)
        
              // Check if the order is paid (for example, from a card payment)
              //
              // A delayed notification payment will have an `unpaid` status, as
              // you're still waiting for funds to be transferred from the customer's
              // account.
              if (session.payment_status === 'paid') {
                fulfillOrder(session)
              }
        
              break
            }
        
            case 'checkout.session.async_payment_succeeded': {
              const session = event.data.object
        
              // Fulfill the purchase...
              fulfillOrder(session)
        
              break
            }
        
            case 'checkout.session.async_payment_failed': {
              const session = event.data.object
        
              // Send an email to the customer asking them to retry their order
              emailCustomerAboutFailedPayment(session)
        
              break
            }
          }

          response.status(200).end()
                  
        } catch (err) {
        return response.status(500).send(err)
    }
})

app.listen(port, () => console.log(`Running on port ${port}`))