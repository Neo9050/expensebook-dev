import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from './config.js';
import approvalRoutes from './routes/dataSaveRoutes.js';
import travelApprovalRoutes from './routes/travelApprovalRoutes.js';
import travelExpenseApprovalRoutes from './routes/travelExpenseApprovalRoutes.js';
import cashAdvance from './routes/cashAdvance.js';
import { errorHandler } from './errorHandler/errorHandler.js';
import startConsumer from './rabbitmq/consumer.js'
// Load environment variables using dotenv
dotenv.config();

const environment = process.env.NODE_ENV || 'development';
console.log(`Running in ${environment} environment`);
console.log(`Database URI: ${config[environment].mongoURI}`);


const MONGODB = process.env.MONGODB_URI;

const app = express();

// middleware
app.use(express.json());
app.use(cors());

//Routes
app.use('/api/approvals', approvalRoutes); // dummy data
app.use('/api/fe/approvals/tr-ca', travelApprovalRoutes);
app.use('/api/fe/approvals/cash', cashAdvance);
app.use('/api/fe/approvals/expense',travelExpenseApprovalRoutes);


app.get('/get',(req,res) => res.status(200).json({message:"Approval microservice is live"}))
/// Start the batch job
//startBatchJob();



const mongodb = async () => {
  try {
    await mongoose.connect(MONGODB);
    console.log('You are Connected to Mongodb');
  } catch (error) {
    console.error('Error connecting to Mongodb:', error);
  }
};

mongodb();


//start consuming messages..From RabbitMq
startConsumer('approval')

// Use the errorHandler middleware at the end
app.use(errorHandler);

const port = process.env.PORT || 8085;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



