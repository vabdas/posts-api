import mongoose from 'mongoose';
import { config } from '../config/config';
import Tag from '../models/Tag';

/**
 * Initialize the database with some sample data
 */
export const initDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database...');
    
    // Connect to MongoDB
    await mongoose.connect(config.database.uri);
    console.log('Connected to MongoDB');
    
    // Create some sample tags if they don't exist
    const sampleTags = [
      { name: 'Technology', slug: 'technology' },
      { name: 'Programming', slug: 'programming' },
      { name: 'Design', slug: 'design' },
      { name: 'Travel', slug: 'travel' },
      { name: 'Food', slug: 'food' },
      { name: 'Lifestyle', slug: 'lifestyle' },
    ];
    
    for (const tagData of sampleTags) {
      const existingTag = await Tag.findOne({ slug: tagData.slug });
      if (!existingTag) {
        await Tag.create(tagData);
        console.log(`Created tag: ${tagData.name}`);
      }
    }
    
    console.log('Database initialization completed!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run if this script is executed directly
if (require.main === module) {
  initDatabase();
}