
const http = require('http');

function testSignup() {
  const postData = JSON.stringify({
    name: "Test User_" + Date.now(),
    email: `testuser_${Date.now()}@example.com`,
    password: "Password123!",
    location: {
      latitude: 28.6139,
      longitude: 77.2090,
      city: "Delhi"
    },
    soilType: "Alluvial Soil",
    cropHistory: ["Wheat"]
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log("Attempting to sign up...");

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log('BODY: ' + rawData);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log("Signup success!");
      } else {
        console.error("Signup failed with status " + res.statusCode);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    // Special marker for my agent logic to look for
    if (e.code === 'ECONNREFUSED') {
      console.log("SERVER_OFFLINE");
    }
  });

  // Write data to request body
  req.write(postData);
  req.end();
}

testSignup();
