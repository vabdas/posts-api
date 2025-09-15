import express from 'express';
import { searchPosts } from '../controllers/searchController';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search posts by keyword in title or description
 * @access  Public
 * @query   {string} q - Search query
 * @query   {number} [page=1] - Page number
 * @query   {number} [limit=10] - Number of items per page
 * @returns {object} Matching posts with pagination info
 */
router.get('/', searchPosts);

export default router;