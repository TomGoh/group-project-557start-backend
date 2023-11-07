const request = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../app');
const { axiosInstance } = require('./axiosHelper');
const dbLib = require('../dbUtils/crud');

describe('Backend Endpoint Tests', () => {
  describe('Blob Endpoint Tests', () => {
    test('blob upload test', async () => {
      const response = await request(app)
        .post('/api/blob')
        .type('form')
        .attach('file', './test/test.jpeg');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('location');
      expect(response.body).toHaveProperty('key');
      const { location } = response.body;
      const fileAccess = await axiosInstance.get(location);
      expect(fileAccess.status).toBe(200);
    }, 10000);
    test('blob invalid file upload test', async () => {
      const response = await request(app)
        .post('/api/blob')
        .type('form')
        .attach('file', './test/backend.test.js');
      expect(response.statusCode).toBe(415);
    }, 10000);
    test('no file uploaed', async () => {
      const response = await request(app)
        .post('/api/blob')
        .type('form')
        .attach('file', undefined);
      expect(response.statusCode).toBe(400);
    }, 10000);
  });

  describe('Post Endpoint Tests', () => {
    let randomUser = null;
    let userId = null;
    let userName = null;
    let randomImageURL = null;
    let randomPostDescription = null;
    const postItem = {};
    let queriedPost = null;

    beforeAll(async () => {
      randomUser = await dbLib.getOneRandomUser();
      userId = randomUser._id;
      userName = randomUser.userName;
      randomImageURL = faker.image.url();
      randomPostDescription = faker.lorem.sentence();
      postItem.userID = userId;
      postItem.userName = userName;
      postItem.imgPath = randomImageURL;
      postItem.description = randomPostDescription;
      await dbLib.createOnePost(postItem);
      [queriedPost] = (await dbLib.getObjectsByQuery('post', { userID: userId, description: randomPostDescription }));
    });

    test('get all posts', async () => {
      const response = await request(app).get('/api/posts');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const newQueriesPost = response.body
        .find((post) => post._id.toString() === queriedPost._id.toString());
      expect(newQueriesPost._id).toEqual(queriedPost._id.toString());
    }, 10000);

    test('get post by id', async () => {
      const response = await request(app).get(`/api/posts/${queriedPost._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const newQueriedPost = response.body[0];
      expect(newQueriedPost._id.toString()).toEqual(queriedPost._id.toString());
    }, 10000);

    test('get post by userID and userName', async () => {
      const response = await request(app).get(`/api/posts/?userID=${userId}&userName=${userName}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const newQueriedPost = response.body
        .filter((post) => post._id.toString() === queriedPost._id.toString())[0];
      expect(JSON.stringify(newQueriedPost)).toEqual(JSON.stringify(queriedPost));
    }, 10000);

    test('get post by userID', async () => {
      const response = await request(app).get(`/api/posts/?userID=${userId}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((post) => post.userID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(userId.toString());
      });
    }, 10000);

    test('post a new post', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send(postItem);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('userID');
      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('imgPath');
      expect(response.body).toHaveProperty('description');
      expect(response.body.userID).toEqual(userId.toString());
      expect(response.body.userName).toEqual(userName);
      expect(response.body.imgPath).toEqual(randomImageURL);
      expect(response.body.description).toEqual(randomPostDescription);
    }, 10000);

    test('delete a post', async () => {
      const newPosts = {
        userID: userId,
        userName,
        imgPath: randomImageURL,
        description: randomPostDescription,
      };
      const newPost = await dbLib.createOnePost(newPosts);
      const response = await request(app).delete(`/api/posts/${newPost._id}`);
      expect(response.statusCode).toBe(200);
      const qPosts = await dbLib.getObjectsByQuery('post', { _id: newPost._id });
      expect(qPosts.length).toBe(0);
    }, 10000);

    test('delete a post that does not exist', async () => {
      const newPosts = {
        userID: userId,
        userName,
        imgPath: randomImageURL,
        description: randomPostDescription,
      };
      const newPost = await dbLib.createOnePost(newPosts);
      await dbLib.deleteOnePostById(newPost._id);
      const response = await request(app).delete(`/api/posts/${newPost._id}`);
      expect(response.body.error).toEqual('Post does not exist');
    }, 10000);

    test('patch a post', async () => {
      const newDescription = faker.lorem.sentence();
      const response = await request(app)
        .patch(`/api/posts/${queriedPost._id}`)
        .send({ description: newDescription });
      expect(response.statusCode).toBe(200);
      const qPosts = await dbLib.getObjectsByQuery('post', { _id: queriedPost._id });
      expect(qPosts[0].description).toEqual(newDescription);
    }, 10000);

    test('get post by userName', async () => {
      const response = await request(app).get(`/api/posts/?userName=${userName}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const names = response.body.map((post) => post.userName);
      names.forEach((name) => {
        expect(name).toBe(userName);
      });
    }, 10000);
  });

  describe('Comment Endpoint Tests', () => {
    let randomUser = null;
    let randomPost = null;
    const randomComment = {};
    let qComment = null;

    beforeAll(async () => {
      randomUser = await dbLib.getOneRandomUser();
      randomPost = await dbLib.getOneRandomPost();
      randomComment.userID = randomUser._id;
      randomComment.userName = randomUser.userName;
      randomComment.postID = randomPost._id;
      randomComment.content = faker.lorem.sentence();
      qComment = await dbLib.createOneComment(randomComment);
    });

    test('get all comments', async () => {
      const response = await request(app).get('/api/comments');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('get comment by id', async () => {
      const response = await request(app).get(`/api/comments/${qComment._id}`);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]._id.toString()).toEqual(qComment._id.toString());
    });
  });
});
