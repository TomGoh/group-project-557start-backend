const {
  User, Post, Comment, Follower, Following, Like,
} = require('./schema');

async function getOneUserByUserId(id) {
  return User.where({ _id: id }).findOne();
}

async function getOneUserByUserName(userName) {
  return User.where({ userName }).findOne();
}

async function insertOneUser(user) {
  return User.create(user);
}

async function getOnePostByPostId(id) {
  return Post.where({ _id: id }).findOne();
}

async function getAllPostsByUserId(id) {
  return Post.where({ userID: id }).find();
}

async function insertOnePost(post) {
  try {
    Post.create(post);
    User.where({ _id: post.userID }).updateOne({ $inc: { postCount: 1 } });
  } catch (err) {
    process.stderr(err);
  }
}

async function getCommentsByPostId(id) {
  return Comment.where({ postID: id }).find();
}

async function insertOneComment(comment) {
  try {
    Comment.create(comment);
    Post.where({ _id: comment.postID }).updateOne({ $inc: { commentCount: 1 } });
  } catch (err) {
    process.stderr(err);
  }
}

async function getCommentsByUserId(id) {
  return Comment.where({ userID: id }).find();
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
    Following.create(following);
    Follower.create(follower);
    User.where({ _id: following.userID }).updateOne({ $inc: { followingCount: 1 } });
    User.where({ _id: following.followingID }).updateOne({ $inc: { followerCount: 1 } });
  } catch (err) {
    process.stderr(err);
  }
}

async function getLikeByPostId(id) {
  return (await Like.where({ postID: id })).find();
}

async function insertOneLike(like) {
  try {
    Like.create(like);
    Post.where({ _id: like.userID }).updateOne({ $inc: { likeCount: 1 } });
  } catch (err) {
    process.stderr(err);
  }
}

module.exports = {
  getOneUserByUserId,
  getOneUserByUserName,
  insertOneUser,
  getOnePostByPostId,
  getAllPostsByUserId,
  insertOnePost,
  getCommentsByPostId,
  insertOneComment,
  getCommentsByUserId,
  getFollowerByUserId,
  getFollowingByUserId,
  insertOneFollowing,
  getLikeByPostId,
  insertOneLike,
};
