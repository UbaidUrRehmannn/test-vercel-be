import { Sequelize } from 'sequelize'; // Import Sequelize to handle DB connections
import { envVariables } from '../constant.js'; // Import environment variables (DATABASE_URL)

// Create a Sequelize instance for PostgreSQL connection
const sequelize = new Sequelize(envVariables.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Disable logging
});

// Connect to PostgreSQL and authenticate
const connectDB = async () => {
  try {
    await sequelize.authenticate(); // Test the database connection
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1); // Exit the application if the DB connection fails
  }
};

// Export sequelize instance and connection methods
export { sequelize, connectDB };
