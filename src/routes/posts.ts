import express from 'express';
import { getPosts, createPost, getPost, deletePost, updatePost } from '../controllers/postsController';

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Get all posts with filtering, sorting, and pagination
 */
router.get('/', getPosts);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 */
router.post('/', createPost);

/**
 * @route   GET /api/posts/:id
 * @desc    Get a single post by ID
 */
router.get('/:id', getPost);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post by ID
 */
router.put('/:id', updatePost);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post by ID
 */
router.delete('/:id', deletePost);

export default router;