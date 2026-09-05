const app = require("./src/app");
const { PORT } = require("./src/config/env");
const { connectDB } = require("./src/config/db");

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
