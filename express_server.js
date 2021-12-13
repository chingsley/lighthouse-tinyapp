const express = require("express");
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { emailExists, isMissing, findUserByEmail, urlsForUser } = require("./helpers/user");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['kjkhhkhkhkhkh'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs");

const PORT = 8080; // default port 8080
const SHORT_URL_LENGTH = 6;
const SALT_LENGTH = 10;

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  },
  t4bpjs: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", SALT_LENGTH)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", SALT_LENGTH)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "eneja.kc@gmail.com",
    password: bcrypt.hashSync("testing", SALT_LENGTH)
  }
};

// console.log(users);

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
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).redirect('/login');
  }

  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID: user_id };

  console.log(urlDatabase);

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  console.log({ user_id }, users[user_id]);
  if (!user_id) {
    return res.status(401).send('you must be logged in to view urls');
  }
  const templateVars = {
    urls: urlsForUser(user_id, urlDatabase),
    user: users[user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).redirect('/login');
  }
  res.render("urls_new", { user: '' });
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const { shortURL } = req.params;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`shortURL ${shortURL} not found`);
  }

  if (!urlsForUser(user_id, urlDatabase)[shortURL]) {
    return res.status(401).send('access denied... you can only access your own url');
  }

  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { updatedURL } = req.body;
  urlDatabase[shortURL].longURL = updatedURL;
  // urlDatabase[shortURL] = { ...urlDatabase[shortURL], longURL: updatedURL };
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  if (!urlDatabase[shortURL]) {
    return res.status(404).json('shortURL not found');
  }
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  req.session.user_id = null;
  return res.redirect('/login');
});

app.get('/register', (req, res) => {
  return res.render("urls_register", { user: '' });
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (isMissing(email, password)) {
    return res.status(400).send('Email and Password are required.');
  }

  if (emailExists(email, users)) {
    return res.status(400).send('Email already exists.');
  }

  const user_id = generateRandomString();
  users[user_id] = { id: user_id, email, password };
  req.session.user_id = user_id;
  console.log(users);
  return res.redirect('/urls');
});

app.get('/login', (req, res) => {
  return res.render("urls_login", { user: '' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);
  if (!user) {
    return res.status(403).send('Invalid email and/or password. LGN01');
  }
  console.log({ email, password, 'user.password': user.password });
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Invalid email and/or password. LGN02');
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
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