const { insertOneObject, getOneObjectByQuery } = require('./dbFunctions');

async function userLogin(email) {
  return getOneObjectByQuery('login', { email });
}

async function userSignUp(email, password) {
  return insertOneObject('login', { email, password });
}

module.exports = {
  userLogin,
  userSignUp,
};
