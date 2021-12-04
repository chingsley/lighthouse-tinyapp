const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const PORT = 8080; // default port 8080
const SHORT_URL_LENGTH = 6;


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
};

const randomChar = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

function generateRandomString(length = SHORT_URL_LENGTH) {
  const alphanumerics = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return new Array(length).fill('').map((_) => alphanumerics[randomChar(0, alphanumerics.length - 1)]).join('');
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;

  console.log(urlDatabase);

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user: '' });
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies['user_id'];
  const { shortURL } = req.params;

  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    user: users[user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { updatedURL } = req.body;
  urlDatabase[shortURL] = updatedURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  return res.redirect('/urls');
});

app.get('/register', (req, res) => {
  return res.render("urls_register", { user: '' });
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const user_id = generateRandomString();
  users[user_id] = { id: user_id, email, password };
  res.cookie('user_id', user_id);
  console.log(users);
  return res.redirect('/urls');
});

// ..............
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// ....................

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});