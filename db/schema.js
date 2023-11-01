const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  userName: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userMotto: { type: String, default: 'No motto yet' },
  userAvatar: { type: String, default: 'https://avatars.githubusercontent.com/u/97165289' },
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
});

const postSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, unique: true, required: true },
  imgPath: { type: String, required: true },
  description: { type: String, default: '' },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const commentSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, unique: true, required: true },
  postID: { type: String, unique: true, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const followingSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, unique: true, required: true },
  followingID: { type: String, unique: true, required: true },
  followingName: { type: String, unique: true, required: true },
});

const followerSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, unique: true, required: true },
  followerID: { type: String, unique: true, required: true },
  followerName: { type: String, unique: true, required: true },
});

const likeSchema = new Schema({
  postID: { type: Schema.Types.ObjectId, required: true, ref: 'Post' },
  userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, unique: true, required: true },
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Following = mongoose.model('Following', followingSchema);
const Follower = mongoose.model('Follower', followerSchema);
const Like = mongoose.model('Like', likeSchema);

module.exports = {
  User,
  Post,
  Comment,
  Following,
  Follower,
  Like,
};
