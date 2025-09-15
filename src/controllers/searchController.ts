import { Request, Response } from 'express';
import Post from '../models/Post';

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search posts by keyword in title or description
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request - missing search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const searchPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query, page = '1', limit = '10' } = req.query;

    if (!query) {
      res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
      return;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Search filter for title/description
    const searchFilter = {
      $or: [
        { title: { $regex: query as string, $options: 'i' } },
        { description: { $regex: query as string, $options: 'i' } }
      ]
    };

    // Fetch paginated posts
    const posts = await Post.find(searchFilter)
      .skip(skip)
      .limit(limitNum);

    // Count total matching posts
    const total = await Post.countDocuments(searchFilter);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching posts',
    });
  }
};