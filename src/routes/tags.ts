import express from 'express';
import { getTags, createTag } from '../controllers/tagsController';

const router = express.Router();

/**
 * @route   GET /api/tags
 * @desc    Get all tags
 * @access  Public
 * @returns {object} Tags array
 */
router.get('/', getTags);

/**
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Public
 * @body    {string} name - Tag name
 * @returns {object} Created tag object
 */
router.post('/', createTag);

export default router;