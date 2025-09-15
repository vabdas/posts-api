import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  description: string;
  imageUrl: string;
  tags: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
PostSchema.index({ title: 'text', description: 'text' });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ tags: 1 });

export default mongoose.model<IPost>('Post', PostSchema);