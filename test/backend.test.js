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
      const [userInfor] = (await dbLib.getObjectsByQuery('user', { _id: userId }));
      const response = await request(app)
        .post('/api/posts')
        .send(postItem);
      const [newUserInfor] = (await dbLib.getObjectsByQuery('user', { _id: userId }));
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('userID');
      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('imgPath');
      expect(response.body).toHaveProperty('description');
      expect(response.body.userID).toEqual(userId.toString());
      expect(response.body.userName).toEqual(userName);
      expect(response.body.imgPath).toEqual(randomImageURL);
      expect(response.body.description).toEqual(randomPostDescription);
      expect(newUserInfor.postCount).toBe(userInfor.postCount + 1);
    }, 10000);

    test('delete a post', async () => {
      const newPosts = {
        userID: userId,
        userName,
        imgPath: randomImageURL,
        description: randomPostDescription,
      };
      const [userInfor] = (await dbLib.getObjectsByQuery('user', { _id: userId }));
      const newPost = await dbLib.createOnePost(newPosts);
      const response = await request(app).delete(`/api/posts/${newPost._id}`);
      expect(response.statusCode).toBe(200);
      const qPosts = await dbLib.getObjectsByQuery('post', { _id: newPost._id });
      const [newUserInfor] = (await dbLib.getObjectsByQuery('user', { _id: userId }));
      expect(qPosts.length).toBe(0);
      expect(newUserInfor.postCount).toBe(userInfor.postCount);
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

    test('get comments by userID and postID', async () => {
      const response = await request(app).get(`/api/comments/?userID=${randomUser._id}&postID=${randomPost._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const newQueriedComment = response.body
        .filter((comment) => comment._id.toString() === qComment._id.toString())[0];
      expect(newQueriedComment._id.toString()).toEqual(qComment._id.toString());
    });

    test('get comments by postID', async () => {
      const response = await request(app).get(`/api/comments/?postID=${randomPost._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((comment) => comment.postID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(randomPost._id.toString());
      });
    });

    test('get comments by userID', async () => {
      const response = await request(app).get(`/api/comments/?userID=${randomUser._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((comment) => comment.userID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(randomUser._id.toString());
      });
    });

    test('post a comment', async () => {
      const [post] = (await dbLib.getObjectsByQuery('post', { _id: randomPost._id }));
      const response = await request(app)
        .post('/api/comments')
        .send(randomComment);
      const [newPost] = (await dbLib.getObjectsByQuery('post', { _id: randomPost._id }));
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('userID');
      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('postID');
      expect(response.body).toHaveProperty('content');
      expect(response.body.userID).toEqual(randomComment.userID.toString());
      expect(response.body.userName).toEqual(randomComment.userName);
      expect(response.body.postID).toEqual(randomComment.postID.toString());
      expect(response.body.content).toEqual(randomComment.content);
      expect(newPost.commentCount).toBe(post.commentCount + 1);
    });

    test('delete a comment', async () => {
      const [oldPost] = (await dbLib.getObjectsByQuery('post', { _id: randomPost._id }));
      const newComment = await dbLib.createOneComment({
        userID: randomUser._id,
        userName: randomUser.userName,
        postID: randomPost._id,
        content: faker.lorem.sentence(),
      });
      const response = await request(app).delete(`/api/comments/${newComment._id}`);
      expect(response.statusCode).toBe(200);
      const qComments = await dbLib.getObjectsByQuery('comment', { _id: newComment._id });
      const [newPost] = (await dbLib.getObjectsByQuery('post', { _id: randomPost._id }));
      expect(qComments.length).toBe(0);
      expect(newPost.commentCount).toBe(oldPost.commentCount);
    });

    test('delete a comment that does not exist', async () => {
      const newComment = await dbLib.createOneComment({
        userID: randomUser._id,
        userName: randomUser.userName,
        postID: randomPost._id,
        content: faker.lorem.sentence(),
      });
      await dbLib.deleteOneCommentById(newComment._id);
      const response = await request(app).delete(`/api/comments/${newComment._id}`);
      expect(response.body).toEqual("comment doesn't exist");
    });
  });

  describe('Like Endpoint Tests', () => {
    let randomUser = null;
    let randomPost = null;
    const randomLike = {};
    let qRandomLike = null;
    beforeAll(async () => {
      randomUser = await dbLib.getOneRandomUser();
      randomPost = await dbLib.getOneRandomPost();
      randomLike.userID = randomUser._id;
      randomLike.userName = randomUser.userName;
      randomLike.postID = randomPost._id;
      randomLike.postDescription = randomPost.description;
      await dbLib.createOneLike(randomLike);
      [qRandomLike] = (await dbLib.getObjectsByQuery('like', { userID: randomUser._id, postID: randomPost._id }));
    });

    test('get all likes', async () => {
      const response = await request(app).get('/api/likes');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('userID');
      const [selectedLike] = response.body
        .filter((like) => like._id.toString() === qRandomLike._id.toString());
      expect(selectedLike._id.toString()).toEqual(qRandomLike._id.toString());
    });

    test('get like by id', async () => {
      const response = await request(app).get(`/api/likes/${qRandomLike._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]._id.toString()).toEqual(qRandomLike._id.toString());
    });

    test('get likes by userID and postID', async () => {
      const response = await request(app).get(`/api/likes/?userID=${randomUser._id}&postID=${randomPost._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const newQueriedLike = response.body
        .filter((like) => like._id.toString() === qRandomLike._id.toString())[0];
      expect(newQueriedLike._id.toString()).toEqual(qRandomLike._id.toString());
    });

    test('get likes by postID', async () => {
      const response = await request(app).get(`/api/likes/?postID=${randomPost._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((like) => like.postID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(randomPost._id.toString());
      });
    });

    test('get likes by userID', async () => {
      const response = await request(app).get(`/api/likes/?userID=${randomUser._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((like) => like.userID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(randomUser._id.toString());
      });
    });

    test('post a like', async () => {
      const post = await dbLib.getOneRandomPost();
      const user = await dbLib.getOneRandomUser();
      const [oldPost] = (await dbLib.getObjectsByQuery('post', { _id: post._id }));
      const response = await request(app)
        .post('/api/likes')
        .send({ userID: user._id, userName: user.userName, postID: post._id });
      const [newPost] = (await dbLib.getObjectsByQuery('post', { _id: post._id }));
      expect(response.statusCode).toBe(200);
      expect(response.body.modifiedCount).toBe(1);
      expect(newPost.likeCount).toBe(oldPost.likeCount + 1);
    });

    test('post a like already exist', async () => {
      await dbLib.getObjectsByQuery('post', { _id: randomPost._id });
      const response = await request(app)
        .post('/api/likes')
        .send(randomLike);
      expect(response.body.error).toEqual('already liked');
    });

    test('delete a like', async () => {
      const post = await dbLib.getOneRandomPost();
      const user = await dbLib.getOneRandomUser();
      const [oldPost] = (await dbLib.getObjectsByQuery('post', { _id: post._id }));
      await request(app)
        .post('/api/likes')
        .send({ userID: user._id, userName: user.userName, postID: post._id });
      const response = await request(app).delete(`/api/likes?postID=${oldPost._id}&userID=${user._id}`);
      const [newPost] = (await dbLib.getObjectsByQuery('post', { _id: post._id }));
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      expect(newPost.likeCount).toBe(oldPost.likeCount);
    });

    test('delete like by id', async () => {
      const post = await dbLib.getOneRandomPost();
      const user = await dbLib.getOneRandomUser();
      const [oldPost] = (await dbLib.getObjectsByQuery('post', { _id: post._id }));
      await request(app)
        .post('/api/likes')
        .send({ userID: user._id, userName: user.userName, postID: post._id });
      const [like] = (await dbLib.getObjectsByQuery('like', { postID: post._id, userID: user._id }));
      const response = await request(app).delete(`/api/likes/${like._id}`);
      const [newPost] = (await dbLib.getObjectsByQuery('post', { _id: post._id }));
      expect(response.statusCode).toBe(200);
      console.log(response.body);
      expect(response.body.deletedCount).toBe(1);
      expect(newPost.likeCount).toBe(oldPost.likeCount);
    });
  });
});
