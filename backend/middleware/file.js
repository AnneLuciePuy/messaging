const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

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

const upload = multer({ storage: storage }).single("image");

const resizeImage = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    // Créer un chemin pour le nouveau fichier redimensionné
    const resizedImagePath = req.file.path.replace(/\.[^/.]+$/, '_resized$&');

    // Redimensionner l'image à une taille spécifique (par exemple, 800x600) vers le nouveau fichier
    sharp(req.file.path)
        .resize(800, 600)
        .toFile(resizedImagePath, (err, info) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Erreur lors du redimensionnement de l'image."
                });
            }

            // Renommer le fichier redimensionné pour écraser l'original
            fs.rename(resizedImagePath, req.file.path, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        message: "Erreur lors du renommage du fichier redimensionné."
                    });
                }

                // Supprimer le fichier redimensionné, car il n'est plus nécessaire
                fs.unlink(resizedImagePath, (err) => {
                    if (err) {
                        console.error(err);
                    }
                    next();
                });
            });
        });
};

module.exports = { upload, resizeImage };