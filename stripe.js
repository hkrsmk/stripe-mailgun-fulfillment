const app = require('express')()
const bodyParser = require('body-parser')
const mailgunSender = require('./mailgun.js')
const config = require('./config.json')
const stripe = require('stripe')(config.stripe.key)

const endpointSecret = config.stripe.signingSecret
const port = config.stripe.port

const fulfillOrder = async (session, recipientEmail) => {
    // TODO: fill me in
    try{
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      )

      console.log("Fulfilling order", lineItems, "for", recipientEmail)

      return mailgunSender.sendMail(recipientEmail, config.email.fulfilled)

    } catch (err) {
        console.log(err)
        throw err
    }
  }

const createOrder = (session) => {
// TODO: fill me in
console.log("Creating order", session)
}

const emailCustomerAboutFailedPayment = async (session, recipientEmail) => {
// TODO: fill me in
console.log("Emailing customer", recipientEmail)
return mailgunSender.sendMail(recipientEmail, config.email.failed)
}

const stripeStartup = () => {
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

                    fulfillOrder(session, session.customer_details.email)
                  }
            
                  break
                }
            
                case 'checkout.session.async_payment_succeeded': {
                  const session = event.data.object
            
                  // Fulfill the purchase...
                  fulfillOrder(session, session.customer_details.email)
            
                  break
                }
            
                case 'checkout.session.async_payment_failed': {
                  const session = event.data.object
            
                  // Send an email to the customer asking them to retry their order
                  emailCustomerAboutFailedPayment(session, session.customer_details.email)
            
                  break
                }
              }
    
              response.status(200).end()
                      
            } catch (err) {
            return response.status(500).send(err)
        }
    })
    
    app.listen(port, () => console.log(`Running on port ${port}`))
}

module.exports = { stripeStartup }