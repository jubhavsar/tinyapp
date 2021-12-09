const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { compile } = require("ejs");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// **** DATA STORE ****
// URLS
let uId;
let urls = {};
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};
//  USERS
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

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
function emailLookUp(newUserEmail) {
  let keyOfUsers = Object.keys(users);
  for (let key of keyOfUsers) {
    if (newUserEmail === users[key].email) {
      uId = users[key].id;
      return uId;
    }
  }
}
function passwordLookUp(newUserPassword) {
  let keyOfUsers = Object.keys(users);
  for (let key of keyOfUsers) {
    if (newUserPassword === users[key].password) {
      uId = users[key].id;
      return uId;
    }
  }
}
function urlsForUser(id){
  let userUrls = {};
    Object.keys(urlDatabase).forEach(function(key){
     if(urlDatabase[key].userID === id){
         let value = urlDatabase[key];
         let newUrl = {
                longURL: value.longURL,
                shortURL: value,
                userID: id
              }
        userUrls[value.shortURL] = newUrl;
    }
  })
  return userUrls;
}
// ROUTES (req, res) => {}
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const user_Id = req.cookies.user_Id;
  if(!user_Id){
    return res.redirect('/login');
  }

  const user = users[user_Id];
  if(!user){
    return res.redirect('/login');
  }

  const userUrls = urlsForUser(user.id);
  const templateVars = { 
    urls:userUrls , 
    user: user 
  };
  res.render("urls_index", templateVars);
  
});
app.post("/urls", (req, res) => {
  const user_Id = req.cookies.user_Id;
  if(!user_Id){
    return res.redirect('/login');
  }

  const user = users[user_Id];
  if(!user){
    return res.redirect('/login');
  }

  const longURL = req.body.longURL;
  if(!longURL){
    return res.status(400).send("You need pass longURL");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: longURL,
    userID: user.id 
  };
  res.redirect(`/urls`);
});
app.get("/urls/new", (req, res) => {
  const user_Id = req.cookies.user_Id;
  if(!user_Id){
    return res.redirect('/login');
  }

  const user = users[user_Id];
  if(!user){
    res.redirect('/login');
  }

  const templateVars = { user: user };
  res.render("urls_new", templateVars);

});
app.get("/urls/:shortURL", (req, res) => {
  const user_Id = req.cookies.user_Id;
  // if(!user_Id){
  //   return res.redirect('/urls_show');
  // }

  const user = users[user_Id];
  // if(!user){
  //   return res.redirect('/login');
  // }

  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlDatabase: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res)=>{
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  if (!urlObject) {
    return res.status(400).send("There is no url is shortURL");
  }
  res.redirect(urlObject.longURL);

})
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_Id = req.cookies.user_Id;
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL:req.body.longURL,
    userID:user_Id
  };
  console.log(urlDatabase);
  res.redirect("/urls");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (emailLookUp(userEmail) && passwordLookUp(userPassword)) {
    res.cookie("user_Id", uId);
    res.redirect("/urls");
  } else {
    res.send("Enter correct email and password");
  }
});
app.get("/login", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  const templateVars = { user: user };
  if(user){
    res.redirect('/urls');
  }
  res.render("urls_login",templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_Id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user_Id = req.cookies.user_Id;
  const user = users[user_Id];
  const templateVars = { user: user };
  if(user){
    res.redirect('/urls');
  }
  res.render("urls_register",templateVars);
});

app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  if (newUserEmail === "" || newUserPassword === "") {
    res.send("Enter correct email and password");
  } else if (emailLookUp(newUserEmail)) {
    res.send("Email already exist");
  }
  const user_Id = generateRandomString();
  users[user_Id] = {
    id: user_Id,
    email: newUserEmail,
    password: newUserPassword,
  };
  res.cookie("user_Id", user_Id);
  res.redirect("/urls");
});

// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
