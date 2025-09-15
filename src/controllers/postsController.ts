import { Request, Response } from 'express';
import Post, { IPost } from '../models/Post';
import Tag from '../models/Tag';
import { uploadToCloud, deleteFromCloud } from '../services/cloudStorage';
import { FilterQuery } from 'mongoose';

/**
 * @desc    Get all posts with filtering, sorting, and pagination
 * @route   GET /api/posts
 * @access  Public
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with filtering, sorting, and pagination
 *     tags: [Posts]
 *     parameters:
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by (title, createdAt, etc.)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: desc
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tag slugs to filter by
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
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
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
    const tagFilter = req.query.tags as string;

    // Build filter object
    const filter: FilterQuery<IPost> = {};
    
    if (tagFilter) {
      const tagIds = await Tag.find({ 
        slug: { $in: tagFilter.split(',').map(tag => tag.trim()) } 
      }).select('_id');
      
      filter.tags = { $in: tagIds.map(tag => tag._id) };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get posts with population of tags
    const posts = await Post.find(filter)
      .populate('tags', 'name slug')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts',
    });
  }
};

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Public
 */
/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       type: array
 *       items:
 *         type: string
 *       collectionFormat: multi
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 description: Post title
 *                 example: "Introduction to JavaScript"
 *               description:
 *                 type: string
 *                 description: Post description
 *                 example: "Learn the basics of JavaScript programming"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag names
 *                 example: ["Programming", "JavaScript"]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Post image file
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *                 message:
 *                   type: string
 *                   example: "Post created successfully"
 *       400:
 *         description: Bad request - missing required fields or invalid file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, tags } = req.body;
    const imageFile = req.files?.image as any;

    // Validate required fields
    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
      return;
    }

    if (!imageFile) {
      res.status(400).json({
        success: false,
        message: 'Image is required',
      });
      return;
    }

    // Validate image file
    if (!imageFile.mimetype.startsWith('image/')) {
      res.status(400).json({
        success: false,
        message: 'Only image files are allowed',
      });
      return;
    }

    // Check file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        message: 'Image size must be less than 5MB',
      });
      return;
    }

    // Upload image to cloud storage
    const uploadResult = await uploadToCloud(imageFile);
    const imageUrl = uploadResult.secure_url;

    // Process tags - create if they don't exist
    let tagArray: string[] = [];
    const tagIds = [];
    if (tags) {
        if (Array.isArray(tags)) {
          tagArray = tags;
        } else if (typeof tags === 'string') {
          tagArray = tags.split(',').map(tag => tag.trim());
        }
      for (const tagName of tagArray) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let tag = await Tag.findOne({ slug });
        
        if (!tag) {
          tag = await Tag.create({ name: tagName, slug });
        }
        
        tagIds.push(tag._id);
      }
    }

    // Create post
    const post = await Post.create({
      title,
      description,
      imageUrl,
      tags: tagIds,
    });

    // Populate tags for response
    await post.populate('tags', 'name slug');

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully',
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating post',
    });
  }
};

/**
 * @desc    Get a single post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id).populate('tags', 'name slug');
    
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post',
    });
  }
};

/**
 * @desc    Delete a post by ID
 * @route   DELETE /api/posts/:id
 * @access  Public
 */
/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    console.log(JSON.stringify(req.params.id))
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    // Delete image from cloud storage
    await deleteFromCloud(post.imageUrl);

    // Delete post from database
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting post',
    });
  }
};

/**
 * @desc    Update a post by ID
 * @route   PUT /api/posts/:id
 * @access  Public
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Post title
 *               description:
 *                 type: string
 *                 description: Post description
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag names
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New post image file (optional)
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *                 message:
 *                   type: string
 *                   example: "Post updated successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, tags } = req.body;
    const imageFile = req.files?.image as any;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    let imageUrl = post.imageUrl;
    
    // If a new image is provided, upload it and delete the old one
    if (imageFile) {
      // Validate image file
      if (!imageFile.mimetype.startsWith('image/')) {
        res.status(400).json({
          success: false,
          message: 'Only image files are allowed',
        });
        return;
      }

      // Check file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          message: 'Image size must be less than 5MB',
        });
        return;
      }

      // Upload new image
      const uploadResult = await uploadToCloud(imageFile);
      imageUrl = uploadResult.secure_url;
      
      // Delete old image
      await deleteFromCloud(post.imageUrl);
    }

    // Process tags
    const tagIds = [];
    if (tags) {
      let tagArray: string[];
      if (Array.isArray(tags)) {
        tagArray = tags;
      } else if (typeof tags === 'string') {
        tagArray = tags.split(',').map(tag => tag.trim());
      } else {
        tagArray = [];
      }
      for (const tagName of tagArray) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let tag = await Tag.findOne({ slug });
        
        if (!tag) {
          tag = await Tag.create({ name: tagName, slug });
        }
        
        tagIds.push(tag._id);
      }
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title: title || post.title,
        description: description || post.description,
        imageUrl,
        tags: tagIds.length > 0 ? tagIds : post.tags,
      },
      { new: true, runValidators: true }
    ).populate('tags', 'name slug');

    res.status(200).json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating post',
    });
  }
};