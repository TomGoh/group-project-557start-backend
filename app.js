const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { urlencoded, json } = require('express');
const { userRouter } = require('./api/users');
const { postRouter } = require('./api/posts');
const { followingRouter } = require('./api/followings');
const { likeRouter } = require('./api/likes');
const { commentRouter } = require('./api/comments');
const { loginRouter } = require('./api/login');
const { registerRouter } = require('./api/register');
const { blobRouter } = require('./api/blob');
const { tokenAuthenticator } = require('./utils/tokenAuthenticator');

const corsOptions = {
	origin: 'http://localhost:3000',
	optionsSuccessStatus: 200,
	credentials: true,
};
const app = express();
const port = 8888;
app.use(cors(corsOptions));
app.use(urlencoded({
	extended: false,
	limit: '10mb',
}));
app.use(json({ limit: '10mb' }));
app.use(cookieParser());

app.listen(port, () => {
	process.stdout.write(`Server listening at http://localhost:${port}\n`);
});
app.use(tokenAuthenticator);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/followings', followingRouter);
app.use('/api/likes', likeRouter);
app.use('/api/comments', commentRouter);
app.use('/api/login', loginRouter);
app.use('/api/signup', registerRouter);
app.use('/api/blob', blobRouter);

module.exports = app;
