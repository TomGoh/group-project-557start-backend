const {
  getOneUserByUserName, insertOneUser, insertOnePost, getOnePostByPostId,
} = require('./db/crud');
const mongoose = require('./db/db');

async function createUser() {
  const user = {
    userName: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
  };

  await insertOneUser(user);
  const queriesUser = await getOneUserByUserName('John Doe');
  console.log(queriesUser);

  const post = {
    userID: queriesUser.id,
    userName: queriesUser.userName,
    imgPath: 'https://picsum.photos/200',
    description: 'This is a test post',
  };
  await insertOnePost(post);
  const queriedPost = await getOnePostByPostId(post.id);
  console.log(queriedPost);
}

createUser().then(() => mongoose.connection.close());
