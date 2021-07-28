require("dotenv").config();
const express = require("express");
const cors = require("cors");

const shortID = require("shortid");
const URL = require("./models/url");
var BodyParser = require("body-parser");
const dns = require("dns");
const urlparser = require("url");
const app = express();



const connectDB = require('./configs/db');

const port = process.env.PORT || 3000;

connectDB();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
app.post("/api/shorturl", async (req, res) => {
  const url = req.body['url'];
  const urlCode = shortID.generate();
  const checkValidUrl = dns.lookup(urlparser.parse(url).hostname, (err, address) => {

    if (!address) {
      res.json({
        error: "invalid url"
      });
    }

    else {
      URL.findOne({ original_url: url }, (err, rec) => {
        if (rec) {
          console.log("Record found in DB");
          res.json({
            original_url: url,
            short_url: urlCode
          })
        }
        else {
          console.log("record not found in DB, creating a new one..");
          let newUrl = new URL({
            original_url: url,
            short_url: urlCode
          });
          newUrl.save((err) => {
            if (err) return console.log(err);
            res.json({
              original_url: url,
              short_url: urlCode
            })
          })
        }
      })
    }
  })
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  try {
    const doc = await URL.findOne({
      short_url: req.params.short_url
    })
    res.redirect(doc.original_url)
  }
  catch (err) {
    res.json({
      error: 'invalid url'
    })
  }
})