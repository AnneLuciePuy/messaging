const Post = require('../models/post');

exports.createPost = (req, res, next) => {
    const url = req.protocol + '://' + req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId
    });
    
    /* res.status(200).json({}); */
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
};

exports.updatePost = (req, res, next) => {
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
  
    console.log('post', post);
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
        console.log('result', result);
        if (result.matchedCount > 0) {
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
};

exports.getPosts = (req, res, next) => {
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
};

exports.getPost = (req, res, next) => {
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
};

exports.deletePost = (req, res, next) => {
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
};