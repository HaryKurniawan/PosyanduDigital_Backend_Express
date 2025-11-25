const register = require('./auth/register');
const login = require('./auth/login');
const getProfile = require('./auth/getProfile');
const getAllUsers = require('./auth/getAllUsers');

module.exports = { 
  register, 
  login, 
  getProfile, 
  getAllUsers 
};