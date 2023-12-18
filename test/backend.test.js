const request = require('supertest');
const { faker } = require('@faker-js/faker');
const appServer = require('../app');
const { imageDelete } = require('../dbUtils/s3Operations');
const { createOnePost, deleteOnePostById, getPostByPostId } = require('../dbUtils/post/postOperations');
const {
  getUserByUserId, getUserByUserName, createOneUser, deleteOneUserById,
} = require('../dbUtils/user/userOperations');
const { createOneComment, getCommentById, deleteOneCommentById } = require('../dbUtils/comment/commentOperations');
const { createOneLike, getLikeByPostIdAndUserId } = require('../dbUtils/like/likeOperations');
const { createOneFollowing, getFollowingById } = require('../dbUtils/following/followingOperations');
const { getHideById, createOneHide } = require('../dbUtils/hide/hideOperations');
const { deleteAllObjects } = require('../dbUtils/dbFunctions');

describe('Backend Endpoint Tests', () => {
  const testUserEmail = faker.internet.email();
  const testUserName = faker.internet.userName();
  const testUserPassword = faker.internet.password();
  let testToken;
  let testUserId;

  beforeAll(async () => {
    const signUpResponse = await request(appServer)
      .post('/api/signup')
      .send({ userName: testUserName, email: testUserEmail, password: testUserPassword });
    expect(signUpResponse.statusCode).toBe(200);
    expect(signUpResponse.body.success).toEqual('user created');
    const loginResponse = await request(appServer)
      .post('/api/login')
      .send({ email: testUserEmail, password: testUserPassword });
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body).toHaveProperty('accessToken');
    expect(loginResponse.body).toHaveProperty('_id');
    testToken = loginResponse.body.accessToken;
    testUserId = loginResponse.body._id.toString();
    process.stdout.write(`Test User ID: ${testUserId}\n`);
    process.stdout.write(`Test User Token: ${testToken}\n`);
  });

  afterAll(async () => {
    await request(appServer).delete(`/api/users/${testUserId}`);
  });

  describe('Blob Endpoint Tests', () => {
    let invalidFilePath;
    let imageKey;

    beforeAll(() => {
      invalidFilePath = './test/backend.test.js';
    });

    afterAll(async () => {
      if (imageKey) {
        await imageDelete(imageKey);
      }
    });

    test('blob invalid file upload test', async () => {
      const response = await request(appServer)
        .post('/api/blob')
        .set('Cookie', `accessToken=${testToken}`)
        .type('form')
        .attach('file', invalidFilePath);
      expect(response.statusCode).toBe(415);
    }, 10000);

    test('no file uploaed', async () => {
      const response = await request(appServer)
        .post('/api/blob')
        .set('Cookie', `accessToken=${testToken}`)
        .type('form')
        .attach('file', undefined);
      expect(response.statusCode).toBe(400);
    }, 10000);
  });

  describe('Post Endpoint Tests', () => {
    let aPostId;
    let bPostId;

    beforeAll(async () => {
      const postItemA = {
        userID: testUserId,
        userName: testUserName,
        imgPath: faker.image.url(),
        description: faker.lorem.sentence(),
      };
      const postItemB = {
        userID: testUserId,
        userName: testUserName,
        imgPath: faker.image.url(),
        description: faker.lorem.sentence(),
      };
      const aCreation = await createOnePost(postItemA);
      const bCreation = await createOnePost(postItemB);
      expect(aCreation).toHaveProperty('_id');
      expect(bCreation).toHaveProperty('_id');
      aPostId = aCreation._id.toString();
      bPostId = bCreation._id.toString();
      process.stdout.write(`Test Post A ID: ${aPostId}\n`);
      process.stdout.write(`Test Post B ID: ${bPostId}\n`);
    });

    afterAll(async () => {
      await request(appServer).delete(`/api/posts/${aPostId}`);
      await request(appServer).delete(`/api/posts/${bPostId}`);
    });

    test('get all posts', async () => {
      const response = await request(appServer)
        .get('/api/posts')
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((post) => post._id);
      expect(ids.includes(`${aPostId}`)).toBe(true);
      expect(ids.includes(`${bPostId}`)).toBe(true);
    }, 10000);

    test('get post by id', async () => {
      const response = await request(appServer)
        .get(`/api/posts/${aPostId}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      const newQueriedPost = response.body;
      expect(newQueriedPost._id.toString()).toEqual(aPostId);
    }, 10000);

    test('get post by userID', async () => {
      const response = await request(appServer)
        .get(`/api/posts/?userID=${testUserId}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const userIds = response.body.map((post) => post.userID.toString());
      userIds.forEach((id) => {
        expect(id.toString()).toBe(testUserId.toString());
      });
      const ids = response.body.map((post) => post._id);
      expect(ids.includes(`${aPostId}`)).toBe(true);
      expect(ids.includes(`${bPostId}`)).toBe(true);
    }, 10000);

    test('get post by userID', async () => {
      const response = await request(appServer)
        .get(`/api/posts/?userID=${testUserId}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((post) => post.userID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(testUserId.toString());
      });
    }, 10000);

    test('post a new post', async () => {
      const userInfor = await getUserByUserId(testUserId);
      const randomPostURL = faker.image.url();
      const randomPostDescription = faker.lorem.sentence();
      const postItem = {
        userID: testUserId,
        userName: testUserName,
        imgPath: randomPostURL,
        description: randomPostDescription,
      };
      const response = await request(appServer)
        .post('/api/posts')
        .send(postItem)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newUserInfor = await getUserByUserId(testUserId);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('userID');
      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('imgPath');
      expect(response.body).toHaveProperty('description');
      expect(response.body.userID).toEqual(testUserId);
      expect(response.body.userName).toEqual(testUserName);
      expect(response.body.imgPath).toEqual(randomPostURL);
      expect(response.body.description).toEqual(randomPostDescription);
      expect(newUserInfor.postCount).toBe(userInfor.postCount + 1);
    }, 10000);

    test('delete a post by id', async () => {
      const randomPostURL = faker.image.url();
      const randomPostDescription = faker.lorem.sentence();
      const postItem = {
        userID: testUserId,
        userName: testUserName,
        imgPath: randomPostURL,
        description: randomPostDescription,
      };
      const postCreation = await createOnePost(postItem);
      const userInfor = await getUserByUserId(testUserId);
      const response = await request(appServer)
        .delete(`/api/posts/${postCreation._id}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newUserInfor = await getUserByUserId(testUserId);
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      expect(newUserInfor.postCount).toBe(userInfor.postCount - 1);
    }, 10000);

    test('delete a post that does not exist', async () => {
      const randomPostURL = faker.image.url();
      const randomPostDescription = faker.lorem.sentence();
      const postItem = {
        userID: testUserId,
        userName: testUserName,
        imgPath: randomPostURL,
        description: randomPostDescription,
      };
      const newPost = await createOnePost(postItem);
      await deleteOnePostById(newPost._id);
      const response = await request(appServer)
        .delete(`/api/posts/${newPost._id}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.body.error).toEqual('invalid params on post.');
    }, 10000);

    test('patch a post', async () => {
      const newDescription = faker.lorem.sentence();
      const response = await request(appServer)
        .patch(`/api/posts/${aPostId}`)
        .send({ description: newDescription })
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      const queriedPost = await getPostByPostId(aPostId);
      expect(queriedPost.description).toEqual(newDescription);
    }, 10000);
  });

  describe('Comment Endpoint Tests', () => {
    let aPostId;
    let bPostId;
    let testUserBId;
    let testUserBToken;
    let testCommentId;

    beforeAll(async () => {
      const postItemA = {
        userID: testUserId,
        userName: testUserName,
        imgPath: faker.image.url(),
        description: faker.lorem.sentence(),
      };
      const postItemB = {
        userID: testUserId,
        userName: testUserName,
        imgPath: faker.image.url(),
        description: faker.lorem.sentence(),
      };
      const aCreation = await createOnePost(postItemA);
      const bCreation = await createOnePost(postItemB);
      expect(aCreation).toHaveProperty('_id');
      expect(bCreation).toHaveProperty('_id');
      aPostId = aCreation._id.toString();
      bPostId = bCreation._id.toString();

      const testUserBEmail = faker.internet.email();
      const testUserBName = faker.internet.userName();
      const testUserBPassword = faker.internet.password();
      const signUpResponse = await request(appServer)
        .post('/api/signup')
        .send({ userName: testUserBName, email: testUserBEmail, password: testUserBPassword });
      expect(signUpResponse.statusCode).toBe(200);
      expect(signUpResponse.body.success).toEqual('user created');
      const loginResponse = await request(appServer)
        .post('/api/login')
        .send({ email: testUserBEmail, password: testUserBPassword });
      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
      testUserBToken = loginResponse.body.accessToken;
      testUserBId = loginResponse.body._id.toString();

      const comment = faker.lorem.sentence();
      const response = await request(appServer)
        .post('/api/comments')
        .send({
          userID: testUserBId, userName: testUserBName, postID: aPostId, content: comment,
        })
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      testCommentId = response.body._id.toString();
    });

    afterAll(async () => {
      await request(appServer).delete(`/api/posts/${aPostId}`);
      await request(appServer).delete(`/api/posts/${bPostId}`);
      await request(appServer).post('/api/logout').set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      await request(appServer).delete(`/api/users/${testUserBId}`);
    });

    test('get all comments', async () => {
      const response = await request(appServer)
        .get('/api/comments')
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('get comment by id', async () => {
      const response = await request(appServer)
        .get(`/api/comments/${testCommentId}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.body._id.toString()).toEqual(testCommentId);
    });

    test('get comments by userID and postID', async () => {
      const response = await request(appServer)
        .get(`/api/comments/?userID=${testUserBId}&postID=${aPostId}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const newQueriedComment = response.body
        .filter((comment) => comment._id.toString() === testCommentId)[0];
      expect(newQueriedComment._id.toString()).toEqual(testCommentId);
    });

    test('get comments by postID', async () => {
      const response = await request(appServer)
        .get(`/api/comments/?postID=${aPostId}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((comment) => comment.postID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(aPostId);
      });
    });

    test('get comments by userID', async () => {
      const response = await request(appServer)
        .get(`/api/comments/?userID=${testUserBId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((comment) => comment.userID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(testUserBId);
      });
    });

    test('delete a comment', async () => {
      const oldPost = await getPostByPostId(aPostId);
      const newComment = await createOneComment({
        userID: testUserBId,
        postID: aPostId,
        content: faker.lorem.sentence(),
      });
      const response = await request(appServer)
        .delete(`/api/comments/${newComment._id}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      const qComments = await getCommentById(newComment._id);
      const newPost = await getPostByPostId(aPostId);
      expect(qComments).toBe(null);
      expect(newPost.commentCount).toBe(oldPost.commentCount);
    });

    test('delete a comment that does not exist', async () => {
      const newComment = await createOneComment({
        userID: testUserBId,
        postID: bPostId,
        content: faker.lorem.sentence(),
      });
      await deleteOneCommentById(newComment._id);
      const response = await request(appServer)
        .delete(`/api/comments/${newComment._id}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.body.error).toEqual('invalid params on comment.');
    });
  });

  describe('Like Endpoint Tests', () => {
    let aPostId;
    let testUserBId;
    let testUserBToken;
    let testLikeId;

    beforeAll(async () => {
      const postItemA = {
        userID: testUserId,
        userName: testUserName,
        imgPath: faker.image.url(),
        description: faker.lorem.sentence(),
      };
      const aCreation = await createOnePost(postItemA);
      expect(aCreation).toHaveProperty('_id');
      aPostId = aCreation._id.toString();

      const testUserBEmail = faker.internet.email();
      const testUserBName = faker.internet.userName();
      const testUserBPassword = faker.internet.password();
      const signUpResponse = await request(appServer)
        .post('/api/signup')
        .send({ userName: testUserBName, email: testUserBEmail, password: testUserBPassword });
      expect(signUpResponse.statusCode).toBe(200);
      expect(signUpResponse.body.success).toEqual('user created');
      const loginResponse = await request(appServer)
        .post('/api/login')
        .send({ email: testUserBEmail, password: testUserBPassword });
      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
      testUserBToken = loginResponse.body.accessToken;
      testUserBId = loginResponse.body._id.toString();

      const likeItem = {
        userID: testUserBId,
        userName: testUserBName,
        postID: aPostId,
      };
      testLikeId = (await createOneLike(likeItem))._id.toString();
    });

    test('get all likes', async () => {
      const response = await request(appServer)
        .get('/api/likes')
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('userID');
      const [selectedLike] = response.body
        .filter((like) => like._id.toString() === testLikeId);
      expect(selectedLike._id.toString()).toEqual(testLikeId);
    });

    test('get like by id', async () => {
      const response = await request(appServer)
        .get(`/api/likes/${testLikeId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toEqual(testLikeId);
    });

    test('get likes by userID and postID', async () => {
      const response = await request(appServer)
        .get(`/api/likes/?userID=${testUserBId}&postID=${aPostId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const newQueriedLike = response.body
        .filter((like) => like._id.toString() === testLikeId)[0];
      expect(newQueriedLike._id.toString()).toEqual(testLikeId);
    });

    test('get likes by postID', async () => {
      const response = await request(appServer)
        .get(`/api/likes/?postID=${aPostId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((like) => like.postID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(aPostId);
      });
    });

    test('get likes by userID', async () => {
      const response = await request(appServer)
        .get(`/api/likes/?userID=${testUserBId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((like) => like.userID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(testUserBId);
      });
    });

    test('post a like', async () => {
      const oldPost = await getPostByPostId(aPostId);
      const response = await request(appServer)
        .post('/api/likes')
        .send({ userID: testUserId, postID: aPostId })
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newPost = await getPostByPostId(aPostId);
      expect(response.statusCode).toBe(200);
      expect(newPost.likeCount).toBe(oldPost.likeCount + 1);
    });

    test('post a like already exist', async () => {
      const response = await request(appServer)
        .post('/api/likes')
        .send({ userID: testUserBId, postID: aPostId })
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.error).toEqual('already liked');
    });

    test('delete a like', async () => {
      await request(appServer)
        .post('/api/likes')
        .send({ userID: testUserId, postID: aPostId })
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const oldPost = await getPostByPostId(aPostId);
      const response = await request(appServer)
        .delete(`/api/likes?postID=${oldPost._id}&userID=${testUserId}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newPost = await getPostByPostId(aPostId);
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      expect(newPost.likeCount).toBe(oldPost.likeCount - 1);
    });

    test('delete like by id', async () => {
      const oldPost = await getPostByPostId(aPostId);
      await request(appServer)
        .post('/api/likes')
        .send({ userID: testUserId, postID: aPostId })
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const like = await getLikeByPostIdAndUserId(aPostId, testUserId);
      const response = await request(appServer)
        .delete(`/api/likes/${like[0]._id}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newPost = await getPostByPostId(aPostId);
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      expect(newPost.likeCount).toBe(oldPost.likeCount);
    });
  });

  describe('User Endpoint Tests', () => {
    test('get all users', async () => {
      const response = await request(appServer)
        .get('/api/users')
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('userName');
      const [selectedUser] = response.body
        .filter((user) => user._id.toString() === testUserId);
      expect(selectedUser._id.toString()).toEqual(testUserId);
    });

    test('get user by id', async () => {
      const response = await request(appServer)
        .get(`/api/users/${testUserId}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toEqual(testUserId);
    });

    test('get user by userName', async () => {
      const response = await request(appServer)
        .get(`/api/users/?userName=${testUserName}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toEqual(testUserId);
    });

    test('get user by userName Like', async () => {
      const response = await request(appServer)
        .get(`/api/users/?userNameLike=${testUserName}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((user) => {
        expect(user.userName.startsWith(testUserName)).toBe(true);
      });
    });

    test('post a user', async () => {
      const response = await request(appServer)
        .post('/api/users')
        .send({
          userName: faker.internet.userName(),
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: faker.internet.email(),
        })
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('userMotto');
      expect(response.body).toHaveProperty('userAvatar');
      expect(response.body).toHaveProperty('email');
      expect(response.body.followingCount).toEqual(0);
      expect(response.body.followerCount).toEqual(0);
      expect(response.body.postCount).toEqual(0);
      expect(response.body._id).toBeDefined();
    });

    test('delete a user by id', async () => {
      const userName = faker.internet.userName();
      await request(appServer)
        .post('/api/users')
        .send({
          userName,
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: faker.internet.email(),
        })
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newUser = await getUserByUserName(userName);
      const response = await request(appServer)
        .delete(`/api/users/${newUser._id}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      const qUsers = await getUserByUserName(userName);
      expect(qUsers).toBe(null);
    });

    test('patch a user by id', async () => {
      const userName = faker.internet.userName();
      await request(appServer)
        .post('/api/users')
        .send({
          userName,
          userMotto: faker.lorem.sentence(),
          userAvatar: faker.image.avatar(),
          email: faker.internet.email(),
        })
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newUser = await getUserByUserName(userName);
      const newMotto = faker.lorem.sentence();
      const response = await request(appServer)
        .patch(`/api/users/${newUser._id}`)
        .send({ userMotto: newMotto })
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.modifiedCount).toBe(1);
      const qUsers = await getUserByUserName(userName);
      expect(qUsers.userMotto).toEqual(newMotto);
    });
  });

  describe('Following Endpoint Tests', () => {
    let testUserB;
    let testUserBId;
    let testUserBToken;
    let aBFollowingId;
    let aBFollowing;

    beforeAll(async () => {
      const testUserBEmail = faker.internet.email();
      const testUserBName = faker.internet.userName();
      const testUserBPassword = faker.internet.password();
      const signUpResponse = await request(appServer)
        .post('/api/signup')
        .send({ userName: testUserBName, email: testUserBEmail, password: testUserBPassword });
      expect(signUpResponse.statusCode).toBe(200);
      expect(signUpResponse.body.success).toEqual('user created');
      const loginResponse = await request(appServer)
        .post('/api/login')
        .send({ email: testUserBEmail, password: testUserBPassword });
      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
      testUserBToken = loginResponse.body.accessToken;
      testUserB = await getUserByUserName(testUserBName);
      testUserBId = testUserB._id.toString();

      aBFollowing = await createOneFollowing({
        followerID: testUserId,
        followingID: testUserBId,
        followerName: testUserName,
        followingName: testUserB.userName,
      });
      aBFollowingId = aBFollowing._id.toString();
    });

    afterAll(async () => {
      await request(appServer).delete(`/api/users/${testUserBId}`);
      await request(appServer).delete(`/api/followings/${aBFollowingId}`);
    });

    test('get all followings', async () => {
      const response = await request(appServer)
        .get('/api/followings')
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('followerID');
      const ids = response.body.map((following) => following._id);
      expect(ids.includes(aBFollowingId)).toBe(true);
    });

    test('get following by id', async () => {
      const following = await getFollowingById(aBFollowingId);
      const response = await request(appServer)
        .get(`/api/followings/${aBFollowingId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body._id.toString()).toEqual(aBFollowingId);
      expect(response.body.followerID.toString()).toEqual(following.followerID.toString());
      expect(response.body.followingID.toString()).toEqual(following.followingID.toString());
    });

    test('get followings by followerID and followingID', async () => {
      const response = await request(appServer)
        .get(`/api/followings/?followerID=${testUserId}&followingID=${testUserBId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].followerID.toString()).toEqual(testUserId.toString());
      expect(response.body[0].followingID.toString()).toEqual(testUserBId.toString());
      expect(response.body[0].followerName).toEqual(testUserName);
      expect(response.body[0].followingName).toEqual(testUserB.userName);
      expect(response.body[0]._id.toString()).toEqual(aBFollowingId);
    });

    test('get followings by followerID', async () => {
      const response = await request(appServer)
        .get(`/api/followings/?followerID=${testUserId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const filteredFollowing = response.body
        .filter((following) => following._id.toString() === aBFollowingId);
      expect(filteredFollowing.length).toBe(1);
    });

    test('get followings by followingID', async () => {
      const response = await request(appServer)
        .get(`/api/followings/?followingID=${testUserBId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const filteredFollowing = response.body
        .filter((following) => following._id.toString() === aBFollowingId);
      expect(filteredFollowing.length).toBe(1);
    });

    test('delete a following by followingID and followerID', async () => {
      await createOneFollowing({
        followerID: testUserBId,
        followingID: testUserId,
        followingName: testUserName,
        followerName: testUserB.userName,
      });
      const oldUser = await getUserByUserId(testUserId);
      const oldUserB = await getUserByUserId(testUserBId);
      const response = await request(appServer)
        .delete(`/api/followings/?followerID=${testUserId}&followingID=${testUserBId}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newUser = await getUserByUserId(testUserId);
      const newUserB = await getUserByUserId(testUserBId);
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      expect(newUser.followingCount).toBe(oldUser.followingCount - 1);
      expect(newUserB.followerCount).toBe(oldUserB.followerCount - 1);
    });

    test('delete a following by id', async () => {
      const oldUser = await getUserByUserId(testUserId);
      const oldUserB = await getUserByUserId(testUserBId);
      const newFollowing = await createOneFollowing({
        followerID: testUserId,
        followingID: testUserBId,
        followerName: testUserName,
        followingName: testUserB.userName,
      });
      const response = await request(appServer)
        .delete(`/api/followings/${newFollowing._id}`)
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newUser = await getUserByUserId(testUserId);
      const newUserB = await getUserByUserId(testUserBId);
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      const qFollowing = await getFollowingById(newFollowing.id);
      expect(qFollowing).toBe(null);
      expect(newUser.followerCount).toBe(oldUser.followerCount);
      expect(newUserB.followingCount).toBe(oldUserB.followingCount);
    });

    test('post a following', async () => {
      const userItem = {
        userName: faker.internet.userName(),
        userMotto: faker.lorem.sentence(),
        userAvatar: faker.image.avatar(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const oldUser = await createOneUser(userItem);
      const oleTestUser = await getUserByUserId(testUserId);
      const response = await request(appServer)
        .post('/api/followings')
        .send({
          followerID: testUserId,
          followingID: oldUser._id,
          followerName: testUserName,
          followingName: oldUser.userName,
        })
        .set('Cookie', `_id=${testUserId};accessToken=${testToken}`);
      const newUser = await getUserByUserId(oldUser._id);
      const newTestUser = await getUserByUserId(oleTestUser._id);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('followerID');
      expect(response.body).toHaveProperty('followingID');
      expect(response.body).toHaveProperty('followerName');
      expect(response.body).toHaveProperty('followingName');
      expect(response.body._id).toBeDefined();
      expect(newUser.followerCount).toBe(oldUser.followerCount + 1);
      expect(newTestUser.followingCount).toBe(oleTestUser.followingCount + 1);
      await deleteOneUserById(oldUser._id);
    });
  });

  describe('Login Endpoint Tests', () => {
    test('login a user', async () => {
      const response = await request(appServer)
        .post('/api/login')
        .send({ email: testUserEmail, password: testUserPassword });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('userMotto');
      expect(response.body).toHaveProperty('userAvatar');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('followerCount');
      expect(response.body).toHaveProperty('followingCount');
      expect(response.body.userName).toEqual(testUserName);
      expect(response.body.email).toEqual(testUserEmail);
      expect(response.body._id).toEqual(testUserId);
    });

    test('login a user that does not exist', async () => {
      const response = await request(appServer)
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
      const response = await request(appServer)
        .post('/api/signup')
        .send({ email, password, userName });
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toEqual('user created');
    });

    test('signup a user with invalid inputs', async () => {
      const response = await request(appServer)
        .post('/api/signup')
        .send({ email: 'dfsghjfdsvbgdfgbdfgdgdg', userName: ' ' });
      expect(response.body.error).toEqual('incomplete user object');
    });

    test('signup email and userName check', async () => {
      const response = await request(appServer)
        .get(`/api/signup?email=${testUserEmail}&username=${testUserPassword}`);
      expect(response.error).not.toBe(undefined);
    });

    test('sign up email check', async () => {
      const response = await request(appServer)
        .get(`/api/signup?email=${testUserEmail}`);
      expect(response.error).not.toBe(undefined);
    });

    test('sign up userName check', async () => {
      const response = await request(appServer)
        .get(`/api/signup?username=${testUserName}`);
      expect(response.error).not.toBe(undefined);
    });
  });

  describe('Hide Post Tests', () => {
    let aPostId;
    let testUserBId;
    let testUserBToken;

    beforeAll(async () => {
      const postItem = {
        userID: testUserId,
        userName: testUserName,
        imgPath: faker.image.url(),
        description: faker.lorem.sentence(),
      };
      createOnePost(postItem).then((post) => {
        aPostId = post._id.toString();
      });
      const userB = {
        userName: faker.internet.userName(),
        userMotto: faker.lorem.sentence(),
        userAvatar: faker.image.avatar(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      await request(appServer)
        .post('/api/signup')
        .send({ email: userB.email, password: userB.password, userName: userB.userName });
      const loginResponse = await request(appServer)
        .post('/api/login')
        .send({ email: userB.email, password: userB.password });
      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
      testUserBToken = loginResponse.body.accessToken;
      testUserBId = loginResponse.body._id.toString();
    });

    afterAll(async () => {
      await request(appServer).delete(`/api/posts/${aPostId}`);
      await request(appServer).delete(`/api/users/${testUserBId}`);
    });

    afterEach(async () => {
      await deleteAllObjects('hide');
    });

    test('hide a post', async () => {
      const response = await request(appServer)
        .post('/api/hide')
        .send({ userID: testUserBId, postID: aPostId })
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('userID');
      expect(response.body).toHaveProperty('postID');
      expect(response.body).toHaveProperty('_id');
      expect(response.body.userID).toEqual(testUserBId);
      expect(response.body.postID).toEqual(aPostId);
      const hide = await getHideById(response.body._id);
      expect(hide.userID.toString()).toEqual(testUserBId);
      expect(hide.postID.toString()).toEqual(aPostId);
    });

    test('get a hide by userID', async () => {
      await request(appServer)
        .post('/api/hide')
        .send({ userID: testUserBId, postID: aPostId })
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      const response = await request(appServer)
        .get(`/api/hide?userID=${testUserBId}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const ids = response.body.map((hide) => hide.userID.toString());
      ids.forEach((id) => {
        expect(id.toString()).toBe(testUserBId.toString());
      });
    });

    test('delete a hide by id', async () => {
      const hide = await createOneHide({
        userID: testUserBId,
        postID: aPostId,
      });
      const response = await request(appServer)
        .delete(`/api/hide/${hide._id}`)
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      const qHide = await getHideById(hide._id);
      expect(qHide).toBe(null);
    });

    test('delete a hide by userID and postID', async () => {
      const hide = await createOneHide({
        userID: testUserBId,
        postID: aPostId,
      });
      const response = await request(appServer)
        .delete('/api/hide')
        .send({ userID: testUserBId, postID: aPostId })
        .set('Cookie', `_id=${testUserBId};accessToken=${testUserBToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.deletedCount).toBe(1);
      const qHide = await getHideById(hide._id);
      expect(qHide).toBe(null);
    });
  });
});
