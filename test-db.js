const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully!');
    
    // Test basic operations
    const testSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    // Create a test document
    const testDoc = await TestModel.create({ name: 'Test Document' });
    console.log('Document created:', testDoc);
    
    // Read the document
    const foundDoc = await TestModel.findById(testDoc._id);
    console.log('Document retrieved:', foundDoc);
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('Test document deleted');
    
    await mongoose.connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

testConnection();