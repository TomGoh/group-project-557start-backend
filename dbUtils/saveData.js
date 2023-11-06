const fs = require('fs');

const {
 User, Post, Comment, Following, Like, Login,
} = require('./schema');

async function localizeAllData() {
  const users = await User.find();
  process.stdout.write(`Users length: ${users.length.toString()}`);
  const posts = await Post.find();
  process.stdout.write(`Posts length: ${posts.length.toString()}`);
  const comments = await Comment.find();
  process.stdout.write(`Comments length: ${comments.length.toString()}`);
  const followings = await Following.find();
  process.stdout.write(`Followings length: ${followings.length.toString()}`);
  const likes = await Like.find();
  process.stdout.write(`Likes length: ${likes.length.toString()}`);
  const logins = await Login.find();
  process.stdout.write(`Logins length: ${logins.length.toString()}`);
  const data = {
    users,
    posts,
    comments,
    followings,
    likes,
    logins,
  };

  fs.writeFileSync('./data/data.json', JSON.stringify(data));
}

function main() {
  localizeAllData();
}

main();
