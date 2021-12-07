const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { compile } = require("ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs") 
function generateRandomString() {
  let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for ( var i = 0; i < 6; i++ ) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Hello!");
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
   const shortURL = generateRandomString();
   urlDatabase[shortURL] = req.body.longURL;
   res.redirect(`/urls`);
   //res.redirect(req.body.longURL);
  });
  app.post("/urls/:shortURL/delete",(req, res)=>{
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
  });
  app.post("/urls/:shortURL",(req, res)=>{
  const shortURL = req.params.shortURL;
  const longURL = req.body.longUrl;
    urlDatabase[shortURL] = longURL;
    res.redirect('/urls');
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});