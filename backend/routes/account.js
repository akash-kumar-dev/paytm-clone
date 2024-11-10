// backend/routes/account.js
const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});

// router.post("/transfer", authMiddleware, async (req, res) => {
//     const session = await mongoose.startSession();

//     session.startTransaction();
//     const { amount, to } = req.body;
//     console.log("helloo")
//     console.log(amount, to)

//     // Fetch the accounts within the transaction
//     const account = await Account.findOne({ userId: req.userId }).session(session);

//     if (!account || account.balance < amount) {
//         await session.abortTransaction();
//         return res.status(400).json({
//             message: "Insufficient balance"
//         });
//     }

//     const toAccount = await Account.findOne({ userId: to }).session(session);

//     if (!toAccount) {
//         await session.abortTransaction();
//         return res.status(400).json({
//             message: "Invalid account"
//         });
//     }

//     // Perform the transfer
//     await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
//     await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

//     // Commit the transaction
//     await session.commitTransaction();
//     res.json({
//         message: "Transfer successful"
//     });
// });

router.post("/transfer", authMiddleware, async (req, res) => {
    const { amount, to } = req.body;

    // Find sender's account
    const account = await Account.findOne({ userId: req.userId });

    if (!account || account.balance < amount) {
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    // Find recipient's account
    const toAccount = await Account.findOne({ userId: to });

    if (!toAccount) {
        return res.status(400).json({
            message: "Invalid account"
        });
    }

    // Perform transfer
    await Account.updateOne(
        { userId: req.userId }, 
        { $inc: { balance: -amount } }
    );
    
    await Account.updateOne(
        { userId: to }, 
        { $inc: { balance: amount } }
    );

    res.json({
        message: "Transfer successful"
    });
});


module.exports = router;