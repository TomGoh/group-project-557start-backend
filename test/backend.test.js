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
      expect(response.body.deletedCount).toBe(1);
      expect(newPost.likeCount).toBe(oldPost.likeCount);
    });
  });

  describe('User Endpoint Tests', () => {
    let randomUser = null;
    beforeAll(async () => {
      randomUser = await dbLib.getOneRandomUser();
    });

    test('get all users', async () => {
      const response = await request(app).get('/api/users');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('userName');
      const [selectedUser] = response.body
        .filter((user) => user._id.toString() === randomUser._id.toString());
      expect(selectedUser._id.toString()).toEqual(randomUser._id.toString());
    });

    test('get user by id', async () => {
      const response = await request(app).get(`/api/users/${randomUser._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]._id.toString()).toEqual(randomUser._id.toString());
    });

    test('get user by userName', async () => {
      const response = await request(app).get(`/api/users/?userName=${randomUser.userName}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('get user by userName Like', async () => {
      const response = await request(app).get(`/api/users/?userNameLike=${randomUser.userName}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((user) => {
        expect(user.userName.startsWith(randomUser.userName)).toBe(true);
      });
    });

    test('post a user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          userName: faker.internet.userName(),
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: faker.internet.email(),
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('userMotto');
      expect(response.body).toHaveProperty('userAvatar');
      expect(response.body).toHaveProperty('email');
      expect(response.body.followingCount).toEqual(0);
      expect(response.body.followerCount).toEqual(0);
      expect(response.body.postCount).toEqual(0);
    });

    test('delete a user by id', async () => {
      const userName = faker.internet.userName();
      await request(app)
        .post('/api/users')
        .send({
          userName,
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: faker.internet.email(),
        });
      const newUser = await dbLib.getObjectsByQuery('user', { userName });
      const response = await request(app).delete(`/api/users/${newUser[0]._id}`);
      expect(response.statusCode).toBe(200);
      const qUsers = await dbLib.getObjectsByQuery('user', { _id: newUser[0]._id });
      expect(qUsers.length).toBe(0);
    });

    test('patch a user by id', async () => {
      const userName = faker.internet.userName();
      await request(app)
        .post('/api/users')
        .send({
          userName,
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: faker.internet.email(),
        });
      const newUser = await dbLib.getObjectsByQuery('user', { userName });
      const newMotto = faker.lorem.sentence();
      const response = await request(app)
        .patch(`/api/users/${newUser[0]._id}`)
        .send({ userMotto: newMotto });
      expect(response.statusCode).toBe(200);
      const qUsers = await dbLib.getObjectsByQuery('user', { _id: newUser[0]._id });
      expect(qUsers[0].userMotto).toEqual(newMotto);
    });
  });

  describe('Following Endpoint Tests', () => {
    let randomUser1 = null;
    let randomUser2 = null;
    let randomUser3 = null;
    beforeAll(async () => {
      const userName1 = faker.internet.userName();
      const userName2 = faker.internet.userName();
      const userName3 = faker.internet.userName();
      await request(app)
        .post('/api/users')
        .send({
          userName: userName1,
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: faker.internet.email(),
        });
      await request(app)
        .post('/api/users')
        .send({
          userName: userName2,
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: faker.internet.email(),
        });
      await request(app)
        .post('/api/users')
        .send({
          userName: userName3,
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: faker.internet.email(),
        });
      [randomUser1] = await dbLib.getObjectsByQuery('user', { userName: userName1 });
      [randomUser2] = await dbLib.getObjectsByQuery('user', { userName: userName2 });
      [randomUser3] = await dbLib.getObjectsByQuery('user', { userName: userName3 });
    });

    test('get all followings', async () => {
      const response = await request(app).get('/api/followings');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('get following by id', async () => {
      await request(app).post('/api/followings').send({
        followerID: randomUser1._id,
        followerName: randomUser1.userName,
        followingID: randomUser2._id,
        followingName: randomUser2.userName,
      });
      const [newFollowing] = await dbLib.getObjectsByQuery('following', {
        followerID: randomUser1._id,
        followingID: randomUser2._id,
      });
      const response = await request(app).get(`/api/followings/${newFollowing._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const filteredFollowing = response.body
        .filter((following) => following._id.toString() === newFollowing._id.toString());
      expect(filteredFollowing.length).toBe(1);
      await dbLib.deleteOneFollowingById(newFollowing._id);
    });

    test('get followings by followerID and followingID', async () => {
      await request(app).post('/api/followings').send({
        followerID: randomUser1._id,
        followerName: randomUser1.userName,
        followingID: randomUser2._id,
        followingName: randomUser2.userName,
      });
      const [newFollowing] = await dbLib.getObjectsByQuery('following', {
        followerID: randomUser1._id,
        followingID: randomUser2._id,
      });
      const response = await request(app).get(`/api/followings/?followerID=${randomUser1._id}&followingID=${randomUser2._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const filteredFollowing = response.body
        .filter((following) => following._id.toString() === newFollowing._id.toString());
      expect(filteredFollowing.length).toBe(1);
      await dbLib.deleteOneFollowingById(newFollowing._id);
    });

    test('get followings by followerID', async () => {
      await request(app).post('/api/followings').send({
        followerID: randomUser1._id,
        followerName: randomUser1.userName,
        followingID: randomUser2._id,
        followingName: randomUser2.userName,
      });
      const [newFollowing] = await dbLib.getObjectsByQuery('following', {
        followerID: randomUser1._id,
        followingID: randomUser2._id,
      });
      const response = await request(app).get(`/api/followings/?followerID=${randomUser1._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const filteredFollowing = response.body
        .filter((following) => following._id.toString() === newFollowing._id.toString());
      expect(filteredFollowing.length).toBe(1);
      await dbLib.deleteOneFollowingById(newFollowing._id);
    });

    test('get followings by followingID', async () => {
      await request(app).post('/api/followings').send({
        followerID: randomUser1._id,
        followingID: randomUser2._id,
      });
      const [newFollowing] = await dbLib.getObjectsByQuery('following', {
        followerID: randomUser1._id,
        followingID: randomUser2._id,
      });
      const response = await request(app).get(`/api/followings/?followingID=${randomUser2._id}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const filteredFollowing = response.body
        .filter((following) => following._id.toString() === newFollowing._id.toString());
      expect(filteredFollowing.length).toBe(1);
      await dbLib.deleteOneFollowingById(newFollowing._id);
    });

    test('delete a following by followingID and followerID', async () => {
      await request(app).post('/api/followings').send({
        followerID: randomUser1._id,
        followingID: randomUser2._id,
      });
      const [newFollowing] = await dbLib.getObjectsByQuery('following', {
        followerID: randomUser1._id,
        followingID: randomUser2._id,
      });
      const response = await request(app).delete(`/api/followings/?followerID=${randomUser1._id}&followingID=${randomUser2._id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      const qFollowings = await dbLib.getObjectsByQuery('following', { _id: newFollowing._id });
      expect(qFollowings.length).toBe(0);
    });

    test('delete a following by id', async () => {
      await request(app).post('/api/followings').send({
        followerID: randomUser1._id,
        followingID: randomUser3._id,
      });
      const user1 = await dbLib.getObjectsByQuery('user', { _id: randomUser1._id });
      const user3 = await dbLib.getObjectsByQuery('user', { _id: randomUser3._id });
      const [newFollowing] = await dbLib.getObjectsByQuery('following', {
        followerID: randomUser1._id,
        followingID: randomUser3._id,
      });
      const response = await request(app).delete(`/api/followings/${newFollowing._id}`);
      const newUser1 = await dbLib.getObjectsByQuery('user', { _id: randomUser1._id });
      const newUser3 = await dbLib.getObjectsByQuery('user', { _id: randomUser3._id });
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      const qFollowings = await dbLib.getObjectsByQuery('following', { _id: newFollowing._id });
      expect(qFollowings.length).toBe(0);
      expect(newUser1[0].followingCount).toBe(user1[0].followingCount - 1);
      expect(newUser3[0].followerCount).toBe(user3[0].followerCount - 1);
    });
  });

  describe('Login Endpoint Tests', () => {
    let randomUser = null;
    let randomUserProfile = null;
    beforeAll(async () => {
      const userName = faker.internet.userName();
      const userEmail = faker.internet.email();
      await request(app)
        .post('/api/users')
        .send({
          userName,
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: userEmail,
        });
      [randomUser] = await dbLib.getObjectsByQuery('user', { userName });
      const ususerPassword = faker.internet.password();
      await dbLib.createOneLogin({
        email: userEmail,
        password: ususerPassword,
      });
      [randomUserProfile] = await dbLib.getObjectsByQuery('login', { email: randomUser.email });
    });

    test('login a user', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ email: randomUserProfile.email, password: randomUserProfile.password });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('userMotto');
      expect(response.body).toHaveProperty('userAvatar');
      expect(response.body).toHaveProperty('email');
      expect(response.body.followingCount).toEqual(0);
      expect(response.body.followerCount).toEqual(0);
      expect(response.body.postCount).toEqual(0);
      expect(response.body.accessToken).toBeTruthy();
    });

    test('login a user that does not exist', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ email: 'not exist', password: 'dfgh' });
      expect(response.statusCode).toBe(200);
      expect(response.body.error).toEqual('Incorrect Email or Password');
    });
  });

  describe('Signup Endpoint Tests', () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const userName = faker.internet.userName();

    test('signup a user', async () => {
      const response = await request(app)
        .post('/api/signup')
        .send({ email, password, userName });
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toEqual('user created');
    });

    test('signup a user with invalid inputs', async () => {
      const response = await request(app)
        .post('/api/signup')
        .send({ email: 'dfsghjfdsvbgdfgbdfgdgdg', userName: ' ' });
      expect(response.body.error).toEqual('invalid input');
    });

    test('signup email and userName check', async () => {
      const randomUser = await dbLib.getOneRandomUser();
      const response = await request(app)
        .get(`/api/signup?email=${randomUser.email}&username=${randomUser.userName}`);
      expect(response.error).not.toBe(undefined);
    });

    test('sign up email check', async () => {
      const randomUser = await dbLib.getOneRandomUser();
      const response = await request(app)
        .get(`/api/signup?email=${randomUser.email}`);
      expect(response.error).not.toBe(undefined);
    });

    test('sign up userName check', async () => {
      const randomUser = await dbLib.getOneRandomUser();
      const response = await request(app)
        .get(`/api/signup?username=${randomUser.userName}`);
      expect(response.error).not.toBe(undefined);
    });
  });
});
