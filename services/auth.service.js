import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      throw new Error(`${field} already exists`);
    }
    throw error;
  }
};

export const findUserByUsername = async (username) => {
  return User.findOne({ username: username.toLowerCase() });
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

export const findUserById = async (id) => {
  return User.findById(id);
};

export const comparePassword = async (password, hashed) => {
  return bcrypt.compare(password, hashed);
};

