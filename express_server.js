const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const { compile } = require("ejs");
const { getUserByEmail } = require("./helpers.js");
// default port 8080
const PORT = 8080; 

// creating an Express app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

// Setting ejs as the template engine
app.set("view engine", "ejs");

// In memory database 
// URLS
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
    // Generate a random id
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
function passwordLookUp(password, obj) {
  let keyOfObj = Object.keys(users);
  for (let key of keyOfObj) {
    if (bcrypt.compareSync(password, obj[key].password)) {
      return key;
    }
  }
}
function urlsForUser(id) {
  let userUrls = {};
  Object.keys(urlDatabase).forEach(function (key) {
    if (urlDatabase[key].userID === id) {
      let value = urlDatabase[key];
      let newUrl = {
        longURL: value.longURL,
        shortURL: value,
        userID: id,
      };
      userUrls[value.shortURL] = newUrl;
    }
  });
  return userUrls;
}
// ROUTES (req, res) => {}
app.get("/", (req, res) => {
  res.send("Hello! Welcome to Tinyapp.");
});
app.get("/urls", (req, res) => {
  const user_Id = req.session.user_Id;
  if (!user_Id) {
    return res.redirect("/login");
  }

  const user = users[user_Id];
  if (!user) {
    return res.redirect("/login");
  }

  const userUrls = urlsForUser(user.id);
  const templateVars = {
    urls: userUrls,
    user: user,
  };
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  const user_Id = req.session.user_Id;
  if (!user_Id) {
    return res.redirect("/login");
  }

  const user = users[user_Id];
  if (!user) {
    return res.redirect("/login");
  }

  const longURL = req.body.longURL;
  if (!longURL) {
    return res.status(400).send("You need pass longURL");
  }

  const shortURL = generateRandomString();
  // if not in the db, it'ok to add in the db
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: longURL,
    userID: user.id,
  };
  res.redirect(`/urls`);
});
app.get("/urls/new", (req, res) => {
  const user_Id = req.session.user_Id;
  if (!user_Id) {
    return res.redirect("/login");
  }

  const user = users[user_Id];
  if (!user) {
    res.redirect("/login");
  }

  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const user_Id = req.session.user_Id;

  const user = users[user_Id];
  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlDatabase: urlDatabase,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  if (!urlObject) {
    return res.status(400).send("There is no url is shortURL");
  }
  res.redirect(urlObject.longURL);
});
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_Id = req.session.user_Id;
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: req.body.longURL,
    userID: user_Id,
  };
  res.redirect("/urls");
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Authenticate the user
app.post("/login", (req, res) => {
  // extract the info from the form
  const email = req.body.email;
  const password = req.body.password;
  if (getUserByEmail(email, users)) {
    // Authenticate the user
    const key = passwordLookUp(password, users);
    req.session.user_Id = `${key}`;
    res.redirect("/urls");
  } else {
    // otherwise we send an error message
    res.send("Enter correct email and password");
  }
});

// Display the login form
app.get("/login", (req, res) => {
  const user_Id = req.session.user_Id;
  const user = users[user_Id];
  const templateVars = { user: user };
  if (user) {
    res.redirect("/urls");
  }

   // render the login page
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Display the register form
app.get("/register", (req, res) => {
  const user_Id = req.session.user_Id;
  const user = users[user_Id];
  const templateVars = { user: user };
  if (user) {
    res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

// Get the info from the register form
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || hashedPassword === "") {
    res.send("Enter correct email and password");

    // check if the user is not already in the database
  } else if (getUserByEmail(email, users)) {
    res.send("Email already exist");
  }
  const user_Id = generateRandomString();
  users[user_Id] = {
    id: user_Id,
    email: email,
    password: hashedPassword,
  };

  req.session.user_Id = `${user_Id}`;
  res.redirect("/urls");
});

// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
