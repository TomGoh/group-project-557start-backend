/* eslint-disable no-underscore-dangle */
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { createOneUser } = require('./user/userOperations');
const { createOnePost } = require('./post/postOperations');
const { createOneComment } = require('./comment/commentOperations');
const { createOneFollowing } = require('./following/followingOperations');
const { createOneLike } = require('./like/likeOperations');
const { userSignup } = require('../api/register');
const { getAllObjects } = require('./dbFunctions');

const SALT_LENGTH = process.env.SALT_LENGTH || 10;
const imagesList = fs.readFileSync('dbUtils/image_urls.txt', 'utf-8').split(/\r?\n/);

async function encryptPassword(password) {
  return bcrypt.hash(password, SALT_LENGTH);
}

async function generateUsers(userCount) {
  const userInfor = [];
  const userLoginInfor = [];
  const hashedPasswords = [];
  for (let i = 0; i < userCount; i += 1) {
    const simplePassword = faker.internet.password();
    hashedPasswords.push(encryptPassword(simplePassword));
    const user = {
      userName: faker.internet.userName(),
      userMotto: faker.lorem.sentence(),
      userAvatar: faker.image.avatar(),
      email: faker.internet.email(),
    };
    const userLogin = {
      email: user.email,
      password: simplePassword,
    };
    userInfor.push(user);
    userLoginInfor.push(userLogin);
  }
  const hashedPasswordsResult = await Promise.all(hashedPasswords);
  for (let i = 0; i < userInfor.length; i += 1) {
    userLoginInfor[i].password = hashedPasswordsResult[i];
  }
  return { userList: userInfor, userLoginList: userLoginInfor };
}

function generatePosts(maxPostCount, users) {
  const posts = users.map((user) => {
    const postCount = Math.floor(Math.random() * maxPostCount);
    return Array.from({ length: postCount }, () => ({
      userID: user._id,
      userName: user.userName,
      imgPath: imagesList[Math.floor(Math.random() * imagesList.length)],
      description: faker.lorem.sentence(),
      likeCount: 0,
      commentCount: 0,
      timestamp: faker.date.recent(),
    }));
  });
  return posts.flat();
}

function generateComments(maxCommentCount, posts) {
  const comments = posts.map((post) => {
    const commentCount = Math.floor(Math.random() * maxCommentCount);
    return Array.from({ length: commentCount }, () => ({
      userID: post.userID,
      userName: post.userName,
      postID: post._id,
      content: faker.lorem.sentence(),
      timestamp: faker.date.recent(),
    }));
  });
  return comments.flat();
}

function generateLikes(maxLikeCount, posts) {
  const likes = posts.map((post) => {
    const likeCount = Math.floor(Math.random() * maxLikeCount);
    return Array.from({ length: likeCount }, () => ({
      postID: post._id,
      userID: post.userID,
      userName: post.userName,
    }));
  });
  return likes.flat();
}

function generateFollowings(maxFollowingCount, users) {
  const followings = users.map((user) => {
    const followingCount = Math.floor(Math.random() * maxFollowingCount);
    return Array.from({ length: followingCount }, () => {
      const following = users[Math.floor(Math.random() * users.length)];
      return {
        followerID: user._id,
        followerName: user.userName,
        followingID: following._id,
        followingName: following.userName,
      };
    });
  });
  return followings.flat();
}

async function populateData() {
  const userCount = 200;
  const maxPostCountPerUser = 20;
  const maxCommentCountPerPost = 3;
  const maxLikeCountPerPost = 10;
  const maxFollowingCountPerUser = 20;

  const { userList, userLoginList } = await generateUsers(userCount);
  await Promise.all(userList.map(async (user) => createOneUser(user)));
  await Promise.all(userLoginList.map(async (userLogin) => userSignup(userLogin)));
  process.stdout.write('User creation done\n');
  const users = await getAllObjects('user');
  const postList = generatePosts(maxPostCountPerUser, users);
  await Promise.all(postList.map(async (post) => createOnePost(post)));
  process.stdout.write('Post creation done\n');
  const posts = await getAllObjects('post');
  const commentList = generateComments(maxCommentCountPerPost, posts);
  const likeList = generateLikes(maxLikeCountPerPost, posts);
  const followingList = generateFollowings(maxFollowingCountPerUser, users);

  return {
    users,
    posts,
    commentList,
    likeList,
    followingList,
  };
}

async function insertData() {
  return populateData().then(async (data) => {
    const commentResults = data.commentList.map(async (comment) => {
      await createOneComment(comment);
    });
    const commentResult = await Promise.all(commentResults);
    process.stdout.write('Comment creation done\n');

    const likeResults = data.likeList.map(async (like) => {
      await createOneLike(like);
    });
    const likeResult = await Promise.all(likeResults);
    process.stdout.write('Like creation done\n');

    const followingResults = data.followingList.map(async (following) => {
      await createOneFollowing(following);
    });
    const followingResult = await Promise.all(followingResults);
    process.stdout.write('Following creation done\n');

    return {
      commentResult,
      likeResult,
      followingResult,
    };
  });
}

async function main() {
  await insertData();
}

main().then(() => {
  process.exit(0);
});
