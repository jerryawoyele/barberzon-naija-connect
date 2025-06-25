import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get port from environment variables or use default
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
