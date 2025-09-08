const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { readdirSync } = require('fs');
const path = require('path');
const os = require('os');
const { connectDB } = require('./config/config-firebase');

const app = express();
const port = 5000;  // local
// const port = 6000;  // server

app.use(cors({
  origin: 'https://speakeasy-th.netlify.app', // ใส่ URL ของ frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.json());



// ฟังก์ชันหาค่า IP ของเครื่องใน network
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Connect to the database
connectDB()
  .then(() => {
    const routesPath = path.join(__dirname, 'routes');
    try {
      const routeFiles = readdirSync(routesPath);
      routeFiles.forEach(r => {
        const route = require(path.join(routesPath, r));
        app.use('/api', route);
      });
    } catch (err) {
      console.error('Error reading routes directory:', err);
      process.exit(1);
    }

    // Start the server
    app.listen(port, '0.0.0.0', () => {
      const ip = getLocalIP();
      console.log(`\n🚀 Server is running at:`);
      console.log(`   Local:    http://localhost:${port}`);
      console.log(`   Network:  http://${ip}:${port}/api\n`);
    });
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });
