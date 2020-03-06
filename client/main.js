// SW registration
let swReg

// Push Server URL]
const serverUrl = 'http://localhost:3333';

// Update UI for subscribed status
const setSubscribedStatus = (state) => {
  console.log('State: ' + state)
  if(state){
    document.getElementById('subscribe').className = 'hidden'
    document.getElementById('unsubscribe').className = ''
  } else {
    document.getElementById('subscribe').className = ''
    document.getElementById('unsubscribe').className = 'hidden'
  }
}

// Register SW
navigator.serviceWorker.register('sw.js').then(registration => {
  // Reference registration globally
  swReg = registration;
  // Check if a subscription exists, and if so, update the UI
  swReg.pushManager.getSubscription()
    .then(setSubscribeStatus)
})
  //Log out errors
  .catch(console.log);

// fetch('http://localhost:3333/subscribe', {method: 'POST'})
//   .then(res => res.text())
//   .then(console.log);

// Get public key from server
const getApplicationServerKey = () => {
  return fetch(`${serverUrl}/key`)
    // Parse response body as arrayBuffer
    .then(res => res.arrayBuffer())
    // Return buffer as new Uint8Array
    .then(key => new Uint8Array(key))
    // .then(console.log)
}

// Unsubscribe from push service
const unsubscribe = () => {
  swReg.pushManager.getSubscription()
    .then(subscription => subscription.unsubscribe()
      .then(() => {
        setSubscribedStatus(false)
      }))
}

// Subscribe for push Notification
const subscribe = () => {
  // console.log('Subscribing');

  // Check if SW registration is available
  if (!swReg) return console.log('Service Worker Registration not found')

  // Get applicationServerKey from push server
  getApplicationServerKey().then(applicationServerKey => {
    swReg.pushManager.subscribe({userVisibleOnly: true, applicationServerKey})
      .then(res => res.toJSON())
      .then(subscription =>{
        // Pass subscription to server
        fetch(`${serverUrl}/subscribe`, {method: "POST", body: JSON.stringify(subscription)})
        // Set status as subscribed
        .then(setSubscribedStatus)
        .catch(unsubscribe)
      }).catch(console.log)
  })
}
