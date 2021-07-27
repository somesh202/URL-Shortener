require('dotenv').config();
const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const shortID = require('short-id');
const URL = require('./models/url')
var BodyParser = require('body-parser')
const app = express();






// parse application/json

const connectDB = require('./configs/db');
// Basic Configuration
const port = process.env.PORT || 3000;

connectDB();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
app.post("/api/shorturl", async (req, res) => {
  const url = req.body['url'];
  const urlCode = shortID.generate();

  
  if(!validUrl.isUri(url)) {
    res.status(400).json({
      error: "Invalid URL"
    });
  }
  else{
       await URL.findOne({original_url: url}, (err, rec) => {
         if(rec) {
           console.log("Record found in DB");
           res.json({
             original_url: url,
             short_url: urlCode
           })
         }
         else{
           console.log("record not found in DB, creating a new one..");
           let newUrl = new URL({
             original_url: url,
             short_url: urlCode
           });
           newUrl.save((err) => {
             if(err) return console.log(err);
             res.json({
               original_url: url,
               short_url: urlCode
             })
           })
         }
       })

 
  }
})

app.get("/api/shorturl/:short_url", async (req, res) => {
  try{
    const doc = await URL.findOne({
      short_url: req.params.short_url
  })
  res.redirect(doc.original_url)
  }
catch(err) {
  res.status(500).send(err);
}
})
