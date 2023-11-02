const { faker } = require('@faker-js/faker');
const {
  insertManyUsers, getAllUsers, insertManyPosts, getAllPosts,
  insertManyComments, insertManyLikes, insertManyFollowings,
} = require('./db/crud');

async function generateUsers(userCount) {
  const users = Array.from({ length: userCount }, () => ({
    userName: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    userMotto: faker.lorem.sentence(),
    userAvatar: faker.image.avatar(),
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
  }));
  return users;
}

async function generatePosts(maxPostCount, users) {
  const posts = users.map((user) => {
    const postCount = Math.floor(Math.random() * maxPostCount);
    return Array.from({ length: postCount }, () => ({
      userID: user._id,
      userName: user.userName,
      imgPath: faker.image.url(),
      description: faker.lorem.sentence(),
      likeCount: 0,
      commentCount: 0,
      timestamp: faker.date.recent(),
    }));
  });
  return posts.flat();
}

async function generateComments(maxCommentCount, posts) {
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

async function generateLikes(maxLikeCount, posts) {
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

async function generateFollowings(maxFollowingCount, users) {
  const followings = await users.map((user) => {
    const followingCount = Math.floor(Math.random() * maxFollowingCount);
    return Array.from({ length: followingCount }, () => {
      const following = users[Math.floor(Math.random() * users.length)];
      return {
        userID: user._id,
        userName: user.userName,
        followingID: following._id,
        followingName: following.userName,
      };
    });
  });
  return followings.flat();
}

function main() {
  const userCount = 10;
  const maxPostCount = 30;
  const maxCommentCount = 5;
  const maxLikeCount = 5;
  const maxFollowingCount = 5;
  const userList = generateUsers(userCount);
  userList.then((users) => {
    insertManyUsers(users).then(() => {
      process.stdout.write('Users inserted\n');
      const queriedUsers = getAllUsers();
      queriedUsers.then((qUsers) => {
        const postList = generatePosts(maxPostCount, qUsers);
        postList.then((posts) => {
          insertManyPosts(posts).then(() => {
            process.stdout.write('Posts inserted\n');
            const queriedPosts = getAllPosts();
            queriedPosts.then((qPosts) => {
              const commentList = generateComments(maxCommentCount, qPosts);
              commentList.then((comments) => {
                insertManyComments(comments).then(() => {
                  process.stdout.write('Comments inserted\n');
                  const likeList = generateLikes(maxLikeCount, qPosts);
                  likeList.then((likes) => {
                    insertManyLikes(likes).then(() => {
                      process.stdout.write('Likes inserted\n');
                      const followingList = generateFollowings(maxFollowingCount, qUsers);
                      followingList.then((followings) => {
                        insertManyFollowings(followings).then(() => {
                          process.stdout.write('Followings inserted\n');
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

// async function populateDB() {
//   try {
//     // await dropAllCollections();
//     const userList = await generateUsers(100);
//     await insertManyUsers(userList);
//     process.stdout.write('Users inserted\n');

//     const queriedUsers = await getAllUsers();
//     const postList = await generatePosts(10, queriedUsers);
//     await insertManyPosts(postList);
//     process.stdout.write('Posts inserted\n');

//     const queriedPosts = await getAllPosts();
//     const commentList = await generateComments(5, queriedPosts);
//     await insertManyComments(commentList);
//     process.stdout.write('Comments inserted\n');

//     const likeList = await generateLikes(10, queriedPosts);
//     await insertManyLikes(likeList);
//     process.stdout.write('Likes inserted\n');

//     const followingList = await generateFollowings(20, queriedUsers);
//     await insertManyFollowings(followingList);
//     process.stdout.write('Followings inserted\n');
//   } catch (error) {
//     console.log(error);
//   }
// }

// function main() {
//   populateDB().then(() => {
//     process.stdout.write('Done!');
//   });
// }

main();
