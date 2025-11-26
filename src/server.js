require('dotenv').config({ path: './src/config/.env' });
const connectDB = require('./config/db');
const { createApp, createServer } = require('./app');

const PORT = process.env.PORT || 3000;

async function main() {
  await connectDB(process.env.MONGO_URI);
  const app = createApp();
  const { server } = await createServer({ expressApp: app });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
