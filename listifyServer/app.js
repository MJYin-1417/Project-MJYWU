const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const path = require('path');
const express = require("express");
const cors = require("cors");
const { Client } = require('pg');
const { generateUploadURL } = require('./s3.js');

dotenv.config();

const client = new Client();

client.connect();

const app = express();



const corsOptions = {
   origin:'*',
   credentials:true, 
   optionSuccessStatus:200,
}
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

let maxID;

app.get('/', (req, response) => {
  const sqlSelectAll = "SELECT * FROM pubs";
  client.query(sqlSelectAll, (err, res) => {
    response.send(res.rows);
  });
});

app.get('/s3Url', async (req, response) => {
  const sqlSelectMax = 
  `SELECT id
   FROM pubs
   WHERE id = (
    SELECT max(id) FROM pubs
    )`;
  let url;
  client.query(sqlSelectMax, async (err, res) => {
    maxID = res.rows[0].id + 1;
    console.log("app.js maxID: " + maxID);
    url = await generateUploadURL(maxID);
    console.log("app.js url: " + url);
    response.send({'url': url});
    // client.end();
  });


})

app.post('/create', async (req, res) => {
  //insert into postgres
  const sqlInsert = "INSERT INTO pubs (title, content, imageUrl) VALUES ($1, $2, $3)";
  console.log(req.body['title'], req.body['content'], req.body['imageUrl']);
  const values = [req.body['title'], req.body['content'], req.body['imageUrl']];
  client.query(sqlInsert, values, (err, res) => {
    console.log(err, res);
    // client.end();
  });
  //get max id
  //need to refactor SELECT MAX
  res.json({message: "Hello from server!"});
});


app.use(express.static(path.resolve(__dirname, "../listing/build")));
app.get("*", function (request, response) {
	response.sendFile(path.resolve(__dirname, "../listing/build", "index.html"));
  });

  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }

app.listen(port, function(){
  console.log(`Server started on port ${port}`);
});