import app from './app.js';
import {connectDB} from './Database/ConnectDB.js';
import Razorpay from 'razorpay';

connectDB();

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});

app.get('/', (req, res) => {
    res.send('API is running...');
});
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});
    