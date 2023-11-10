const express = require('express');
const multer = require('multer')

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file,cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        };
        cb(error, "backend/images");
    },
    filename: (req, file,cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
});

router.post(
    "", 
    checkAuth,
    multer({ storage: storage }).single("image"), (req, res, next) => {
    const url = req.protocol + '://' + req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId
    });
    
    res.status(200).json({});
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'Post added successfully!',
            post: {
                ...createdPost,
                id: createdPost._id
            }

        });
    })
    .catch(error => {
        res.status(500).json({
            message: "La création du message a échoué!"
        });
    });
})

router.get("", (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;

    if (pageSize && currentPage) {
        postQuery
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize); 
    };

    postQuery
    .then(documents => {
        fetchedPosts = documents;
        return Post.countDocuments();
    })
    .then(count => {
        res.status(200).json({
            message: "Les messages ont été récupérés avec succès!",
            posts: fetchedPosts,
            maxPosts: count
        });
    })
    .catch(error => {
        res.status(500).json({
            message: "La répupération des messages a échoué!"
        });
    });;
});

router.get("/:id", (req, res, next) => {
    Post.findById(req.params.id)
    .then( post => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: "Le message est introuvable!" });
        };
    })
    .catch(error => {
        res.status(500).json({
            message: "La répupération du message a échoué!"
        });
    });
})

router.put(
    "/:id", 
    checkAuth,
    multer({ storage: storage }).single("image"), (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + '://' + req.get("host");
        imagePath = url + "/images/" + req.file.filename;
    };
    
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    });
  
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Le message a été modifié avec succès!' });
        } else {
            res.status(401).json({ message: "Vous n'êtes pas autorisé à modifier le message!" });
        };
    })
    .catch(error => {
        res.status(500).json({
            message: "La modification du message a échoué!"
        });
    });;
})

router.delete("/:id", checkAuth, (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
        console.log('result', result)
        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Le message a été supprimé avec succès!" });
        } else {
            res.status(401).json({ message: "Vous n'êtes pas autorisé à supprimer le message!" });
        };
    })
    .catch(error => {
        res.status(500).json({
            message: "La suppression du message a échoué!"
        });
    });;
});

module.exports = router;