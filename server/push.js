// Modules
const webpush = require('web-push')
const urlSafe = require('urlsafe-base64')
const Storage = require('node-storage')

// Vapid keys
const vapid = require('./vapid.json');

// Configure web-push
webpush.setVapidDetails(
  'mailto: witter.fernanda@gmail.com',
  vapid.publicKey,
  vapid.privateKey
)

// Subscriptions
const store = new Storage(`${__dirname}/db`)
let subscriptions = store.get('subscriptions') || []

// Create URL safe vapid public key
module.exports.getKey = () => {

  // Safely encoded Base64 stream
  return urlSafe.decode(vapid.publicKey)
}

// Store new subscription
module.exports.addSubscription = (subscription) => {
  // Add to subscriptions array
subscriptions.push(subscription)

  // Persist subscription
  store.put('subscriptions', subscriptions)
}

// Send notifications to all registered Subscriptions
module.exports.send = (message) => {
  // Notification promises
  let notifications = []

  // Loop Subscriptions
  subscriptions.forEach((sub, i) => {
    let p = webpush.sendNotification(sub, message)
      .catch(status => {
        // Check for "410 - Gone" setSubscribeStatus
        if(status.statusCode === 410) subscriptions[i]['delete'] = true

        // if a rejection is returned, Promise.all() will fail, but any return other than rejection will keep it going
        return null
      })

      // Push notification promise to array
      notifications.push(p)
  });

  // Make sure all promises are done before removing missing Subscriptions
  Promise.all(notifications).then(() => {
    // Filter Subscriptions
    subscriptions = subscriptions.filter(subscription => !subscription.delete)

    // Persist 'cleaned' Subscriptions
    store.put('subscriptions', subscriptions)
  })
}
