const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { compile } = require("ejs");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
let uId;
// **** DATA STORE ****
// URLS
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
//  USERS
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
//**** HELPING FUNCTIONS ****
function generateRandomString() {
  let randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (var i = 0; i < 6; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}
function emailLookUp(newUserEmail){
  
let keyOfUsers = Object.keys(users);
for(let key of keyOfUsers){
  if(newUserEmail === users[key].email){
     uId =  users[key].id;
    return uId;
  }
}
}
function passwordLookUp(newUserPassword){
  let keyOfUsers = Object.keys(users);
for(let key of keyOfUsers){
  if(newUserPassword === users[key].password){
     uId =  users[key].id;
    return uId;
  }
}
}
// ROUTES (req, res) => {}
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longUrl;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  // const username = req.body.username;
  //const user_Id = req.cookies.user_Id;
  if(emailLookUp(userEmail) && passwordLookUp(userPassword)){
    res.cookie("user_Id", uId); 
    res.redirect("/urls");
  }else {
      res.send('Enter correct email and password');
  }

  console.log(userEmail,userPassword)
});
app.post("/logout", (req, res) => {
  res.clearCookie('user_Id');
  //res.clearCookie("username");
  res.redirect("/urls");
});
app.get("/register", (req, res)=>{
  res.render('urls_register');
})

app.post('/register',(req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  if(newUserEmail === '' || newUserPassword === ''){
    res.send('Enter correct email and password');
  } else if(emailLookUp(newUserEmail)){
    res.send('Email already exist');
  }
  const user_Id = generateRandomString();
  users[user_Id] ={id:user_Id,email:newUserEmail,password:newUserPassword};
  console.log(users);
  res.cookie('user_Id', user_Id);
  res.redirect('/urls');
})
app.get("/login", (req, res) => {
res.render('urls_login');
});
// LISTEN 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
