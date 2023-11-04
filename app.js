const express = require('express');
const cors = require('cors');
const { userRouter } = require('./api/users');
const { postRouter } = require('./api/posts');
const { followingRouter } = require('./api/followings');
const { likeRouter } = require('./api/likes');
const { commentRouter } = require('./api/comments');
const { loginRouter } = require('./api/login');
const { registerRouter } = require('./api/register');
const { urlencoded, json } = require('express');

const app = express();
const port = 8888;
app.use(cors());
app.use(urlencoded({
	extended: false
}));
app.use(json());

app.listen(port, () => {
	process.stdout.write(`Server listening at http://localhost:${port}`);
});

app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/followings', followingRouter);
app.use('/api/likes', likeRouter);
app.use('/api/comments', commentRouter);
app.use('/api/login', loginRouter);
app.use('/api/signup', registerRouter);

module.exports = app;