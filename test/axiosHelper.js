/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
// const axios = require('axios/dist/node/axios.cjs');
const axios = require('axios');
// import dotenv from 'dotenv';

function getInstance(baseAPI, timeout) {
  const instance = axios.create({
    baseURL: 'http://localhost:8888/api',
    timeout: timeout || 100000,
  });
  return instance;
}

function getFormRequestInstance(baseAPI, timeout) {
  const instance = axios.create({
    baseURL: 'http://localhost:8888/api',
    timeout: timeout || 100000,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return instance;
}

const axiosInstance = getInstance();
const axiosFormInstance = getFormRequestInstance();

module.exports = { axiosInstance, axiosFormInstance };
