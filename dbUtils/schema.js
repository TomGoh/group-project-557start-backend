const mongoose = require('./db');

const { Schema } = mongoose;

const loginSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const userSchema = new Schema({
  userName: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  userMotto: { type: String, default: 'No motto yet' },
  userAvatar: { type: String, default: 'https://avatars.githubusercontent.com/u/97165289' },
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
});

const postSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  imgPath: { type: String, required: true },
  description: { type: String, default: 'No description' },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const commentSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  postID: { type: Schema.Types.ObjectId, required: true, ref: 'Post' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const followingSchema = new Schema({
  followerID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  followerName: { type: String, required: true },
  followingID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  followingName: { type: String, required: true },
});

const likeSchema = new Schema({
  postID: { type: Schema.Types.ObjectId, required: true, ref: 'Post' },
  userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
});

const hideSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  postID: { type: Schema.Types.ObjectId, required: true, ref: 'Post' },
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Following = mongoose.model('Following', followingSchema);
const Like = mongoose.model('Like', likeSchema);
const Login = mongoose.model('Login', loginSchema);
const Hide = mongoose.model('Hide', hideSchema);

module.exports = {
  User,
  Post,
  Comment,
  Following,
  Like,
  Login,
  Hide,
};
