// Modules
const http = require('http');
const push = require('./push')

// Create HTTP Server
http.createServer((request, response) => {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*')

  // Get request variables
  const {url, method} = request

  // Subscribe
  // Post request to /subscribe/*
  if(method === 'POST' && url.match(/^\/subscribe\/?/)){
    // Get POST body
    let body = []

    // Read body stream
    request.on('data', chunk => body.push(chunk))
      .on('end', () => {
        // Parse subscription boy to object
        let subscription = JSON.parse(body.toString())
        // console.log(subscription);

        // Store subscription for push notification
        push.addSubscription(subscription);

        //Respond
        response.end('Subscribed')
      })

  // GET request to key/* supplies the public key
  } else if (url.match(/^\/key\/?/)){

    // Get Key from push module
    let key = push.getKey()
    response.end(key)

  // Push Notification
  // Not generally a public endpoint
  } else if(method === 'POST' && url.match(/^\/push\/?/)){
    // Get POST body
    let body = []

    // Read body stream
    request.on('data', chunk => body.push(chunk))
      .on('end', () => {
        // Send notification with POST body
        push.send(body.toString())
        // Respond
        response.end(`Push sent`)
      })

  // Not Found
  } else {
    response.status = 404
    response.end('Error: Unknown Request')
  }

  // res.end('Hello from HTTP Server!');
})
// Start Server
.listen(3333, () => {console.log('Server running!');})
