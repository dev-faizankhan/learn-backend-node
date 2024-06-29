// routes/postRoutes.js
import express from 'express';
import multer from 'multer';
import { readData, writeData } from '../config/fileStorage.js';
import auth from '../middlewares/auth.js';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanFilename = slugify(file.originalname, { replacement: '-', lower: true, strict: true });
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}-${cleanFilename}${ext}`);
    }
});

const upload = multer({ storage: storage });

// Create Post Route
router.post('/', auth, upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const posts = readData('posts.json');
    const newPost = {
        id: Date.now().toString(),
        title,
        content,
        image: req.file ? req.file.filename : null,
    };
    posts.push(newPost);
    writeData('posts.json', posts);
    res.status(201).json({ msg: 'Post created successfully', post: newPost });
});

router.get('/', auth, (req, res) => {
    const posts = readData('posts.json');
    res.json(posts);
});

router.get('/:id', auth, (req, res) => {
    const posts = readData('posts.json');
    const post = posts.find(p => p.id === req.params.id);
    if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
});

router.put('/:id', auth, (req, res) => {
    const posts = readData('posts.json');
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) {
        return res.status(404).json({ msg: 'Post not found' });
    }
    const updatedPost = { ...posts[postIndex], ...req.body };
    posts[postIndex] = updatedPost;
    writeData('posts.json', posts);
    res.json(updatedPost);
});

router.delete('/:id', auth, (req, res) => {
    const posts = readData('posts.json');
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) {
        return res.status(404).json({ msg: 'Post not found' });
    }
    const [deletedPost] = posts.splice(postIndex, 1);
    if (deletedPost.image) {
        fs.unlinkSync(path.join('uploads', deletedPost.image));
    }
    writeData('posts.json', posts);
    res.json(deletedPost);
});

export default router;
