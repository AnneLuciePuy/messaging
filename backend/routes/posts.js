const express = require('express');

const PostsController = require('../controllers/posts');

const checkAuth = require('../middleware/check-auth');
/* const extractFile = require('../middleware/file'); */
const { upload, resizeImage } = require('../middleware/file');

const router = express.Router();

router.get("", PostsController.getPosts);

router.get("/:id", PostsController.getPost);

router.post("", checkAuth, upload, resizeImage, PostsController.createPost);

router.put("/:id", checkAuth, upload, resizeImage, PostsController.updatePost);

router.delete("/:id", checkAuth, PostsController.deletePost);

module.exports = router;