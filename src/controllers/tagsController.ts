import { Request, Response } from 'express';
import Tag from '../models/Tag';
/**
 * @desc    Get all tags
 * @route   GET /api/tags
 * @access  Public
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>}
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of tags retrieved successfully
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
 *                     $ref: '#/components/schemas/Tag'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tags',
    });
  }
};

/**
 * @desc    Create a new tag
 * @route   POST /api/tags
 * @access  Public
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>}
 */
/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tag name
 *                 example: "Technology"
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - tag already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Tag name is required',
      });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check if tag already exists
    const existingTag = await Tag.findOne({ slug });
    if (existingTag) {
      res.status(409).json({
        success: false,
        message: 'Tag already exists',
      });
      return;
    }

    const tag = await Tag.create({ name, slug });
    
    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tag',
    });
  }
};