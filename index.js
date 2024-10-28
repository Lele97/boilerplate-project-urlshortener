require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express();
const dns = require('dns')

// Basic Configuration
const port = process.env.PORT;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

let inMemoryDb={};
let index=0;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req,res)=>{
    const url = req.body.url

   // Check if URL follows the correct format
  const regex = /^(http|https):\/\/[^ "]+$/;
  if (!regex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Extract the hostname from the URL
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // Use dns.lookup to verify the URL
  dns.lookup(hostname, (err) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      index = index +1;
      let shortUrl = index;
      console.log(shortUrl)
      inMemoryDb[index]=url
      res.json({ original_url: url, short_url: shortUrl });
    }
  });
});

app.get("/api/shorturl/:short_url$", (req, res) => {
  let shortUrl = req.params.short_url;
  let original_url;

  // Check if shortUrl is an empty string
  if (!shortUrl) {
    return res.json({ error: 'Short URL parameter is empty' });
  }

  // Check if shortUrl exists in inMemoryDb
  if (inMemoryDb.hasOwnProperty(shortUrl)) {
    original_url = inMemoryDb[shortUrl];
    console.log("Original Url : " + original_url);
    res.json({ original_url: original_url });
  } else {
    res.json({ error: "Key inesistente" });
  }
});

app.get('/inMemoryGet', (req, res) => {
  res.send(`<pre>${JSON.stringify(inMemoryDb, null, 2)}</pre>`);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});