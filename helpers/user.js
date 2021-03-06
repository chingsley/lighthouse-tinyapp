function isMissing(...args) {
  for (let field of args) {
    if (!field) {
      return true;
    }
  }
  return false;
}

function findUserByEmail(email, users) {
  for (let user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    }
  }
  return null;
}

function emailExists(email, users) {
  if (findUserByEmail(email, users)) {
    return true;
  }
  return false;
}

function urlsForUser(userID, urlDatabase) {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      result = { ...result, [key]: urlDatabase[key] };
    }
  }
  console.log(result);
  return result;
}

module.exports = {
  isMissing,
  findUserByEmail,
  emailExists,
  urlsForUser
};
