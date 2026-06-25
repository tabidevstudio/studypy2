"use strict";

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'studypy_super_secret_session_key_98765';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studypy_test');

  const email = `test.user+${Date.now()}@studypy.dev`;
  let user = new User({ username: 'Test User', email, avatar: '', streak: { count: 0, lastActiveDate: '' } });
  await user.save();

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  console.log('COOKIE:', `studypy_token=${token}`);
  console.log('TOKEN:', token);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
