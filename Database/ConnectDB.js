import mongoose from "mongoose";

export const connectDB = async () => {
  const connect = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(
    `MongoDB connected\nHost: ${connect.connection.host} \nDatabase: ${connect.connection.name} \nPort: ${connect.connection.port}`
  );
};
