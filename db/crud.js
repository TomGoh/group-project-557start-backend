const {
  User, Post, Comment, Follower, Following, Like,
} = require('./schema');

async function getOneUserByUserId(id) {
  return User.where({ _id: id }).findOne();
}

async function getOneUserByUserName(userName) {
  return User.where({ userName }).findOne();
}

async function getAllUsers() {
  return User.find();
}

async function insertOneUser(user) {
  return User.create(user);
}

async function insertManyUsers(users) {
  return User.create(users);
}

async function updateOneUser(user) {
  return User.where({ _id: user.id }).updateOne(user);
}

async function deleteOneUser(user) {
  try {
    User.where({ _id: user._id }).deleteOne();
    Post.where({ userID: user._id }).deleteMany();
    Comment.where({ userID: user._id }).deleteMany();
    Following.where({ userID: user._id }).deleteMany();
    Follower.where({ userID: user._id }).deleteMany();
    Like.where({ userID: user._id }).deleteMany();
  } catch (err) {
    process.stdout.write(err);
  }
}

async function deleteAllUsers() {
  try {
    User.deleteMany();
    Post.deleteMany();
    Comment.deleteMany();
    Following.deleteMany();
    Follower.deleteMany();
    Like.deleteMany();
  } catch (err) {
    process.stdout.write(err);
  }
}

async function getOnePostByPostId(id) {
  return Post.where({ _id: id }).findOne();
}

async function getAllPosts() {
  return Post.find();
}

async function getAllPostsByUserId(id) {
  return Post.where({ userID: id }).find();
}

async function insertOnePost(post) {
  try {
    Post.create(post).then(() => {
      const result = User.where({ _id: post.userID }).updateOne({ $inc: { postCount: 1 } });
      return result;
    });
  } catch (err) {
    process.stdout.write(err);
  }
}

async function insertManyPosts(posts) {
  try {
    const results = posts.map((post) => {
      insertOnePost(post);
    });
    Promise.all(results).then();
  } catch (err) {
    process.stdout.write(err);
  }
}

async function updateOnePost(post) {
  return Post.where({ _id: post.id }).updateOne(post);
}

async function deleteOnePost(post) {
  try {
    await Post.where({ _id: post._id }).deleteOne();
    await Comment.where({ postID: post._id }).deleteMany();
    await Like.where({ postID: post._id }).deleteMany();
    await User.where({ _id: post.userID }).updateOne({ $inc: { postCount: -1 } });
  } catch (err) {
    process.stdout.write(err);
  }
}

async function getCommentsByPostId(id) {
  return Comment.where({ postID: id }).find();
}

async function insertOneComment(comment) {
  try {
    await Comment.create(comment);
    await Post.where({ _id: comment.postID }).updateOne({ $inc: { commentCount: 1 } });
  } catch (err) {
    process.stdout.write(err);
  }
}

async function insertManyComments(comments) {
  try {
    comments.forEach((comment) => {
      insertOneComment(comment);
    });
  } catch (err) {
    process.stdout.write(err);
  }
}

async function getCommentsByUserId(id) {
  return Comment.where({ userID: id }).find();
}

async function updateOneComment(comment) {
  return Comment.where({ _id: comment.id }).updateOne(comment);
}

async function deleteOneComment(comment) {
  try {
    await Comment.where({ _id: comment._id }).deleteOne();
    await Post.where({ _id: comment.postID }).updateOne({ $inc: { commentCount: -1 } });
  } catch (err) {
    process.stdout.write(err);
  }
}

async function getFollowerByUserId(id) {
  return Follower.where({ userID: id }).find();
}

async function getFollowingByUserId(id) {
  return Following.where({ userID: id }).find();
}

async function insertOneFollowing(following) {
  try {
    const follower = new Follower({
      userID: following.followingID,
      userName: following.followingName,
      followerID: following.userID,
      followerName: following.userName,
    });
    await Following.create(following);
    await Follower.create(follower);
    await User.where({ _id: following.userID }).updateOne({ $inc: { followingCount: 1 } });
    await User.where({ _id: following.followingID }).updateOne({ $inc: { followerCount: 1 } });
  } catch (err) {
    process.stdout.write(err);
  }
}

async function insertManyFollowings(followings) {
  try {
    followings.forEach((following) => {
      insertOneFollowing(following);
    });
  } catch (err) {
    process.stdout.write(err);
  }
}

async function getLikeByPostId(id) {
  return (await Like.where({ postID: id })).find();
}

async function insertOneLike(like) {
  try {
    await Like.create(like);
    await Post.where({ _id: like.postID }).updateOne({ $inc: { likeCount: 1 } });
  } catch (err) {
    process.stdout.write(err);
  }
}

async function insertManyLikes(likes) {
  try {
    likes.forEach((like) => {
      insertOneLike(like);
    });
  } catch (err) {
    process.stdout.write(err);
  }
}

async function dropAllCollections() {
  try {
    User.collection.drop();
    Post.collection.drop();
    Comment.collection.drop();
    Following.collection.drop();
    Follower.collection.drop();
    Like.collection.drop();
  } catch (err) {
    process.stdout.write(err);
  }
}

module.exports = {
  getOneUserByUserId,
  getOneUserByUserName,
  getAllUsers,
  insertOneUser,
  insertManyUsers,
  updateOneUser,
  deleteOneUser,
  deleteAllUsers,
  getOnePostByPostId,
  getAllPosts,
  getAllPostsByUserId,
  insertOnePost,
  insertManyPosts,
  updateOnePost,
  deleteOnePost,
  getCommentsByPostId,
  insertOneComment,
  insertManyComments,
  getCommentsByUserId,
  updateOneComment,
  deleteOneComment,
  getFollowerByUserId,
  getFollowingByUserId,
  insertOneFollowing,
  insertManyFollowings,
  getLikeByPostId,
  insertOneLike,
  insertManyLikes,
  dropAllCollections,
};
