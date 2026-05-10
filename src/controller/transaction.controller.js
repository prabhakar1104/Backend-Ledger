const transactionModel = require("../model/transation.model");
const accountModel = require("../model/account.model");
const ledgerModel = require("../model/ledger.model");
const mongoose = require("mongoose");
const emailService = require("../services/email.service");

/**
 * 1. Validate Request
 * 2. Validate IdompotencyKey
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create Transaction (Pending)
 * 6. Create Debit ledger entry
 * 7. Create Credit ledger entry
 * 8. Mark Trnasation Completed
 * 9. Commit Mongo Session
 * 10. Send Email Notification
 */

const createTransaction = async (req, res) => {
  const { fromAccount, toAccount, ammount, idempotencyKey } = req.body;

  /**
   * Validate Request
   */
  if (!fromAccount || !toAccount || !ammount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, ammount, idempotencyKey is important",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAcount or fromAccount",
    });
  }

  /**
   * Validate IdempotencyKey
   */

  const isTransactionAlreadyExist = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExist) {
    if (isTransactionAlreadyExist.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction Already Processed",
        transaction: isTransactionAlreadyExist,
      });
    }
    if (isTransactionAlreadyExist.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still Processing",
      });
    }
    if (isTransactionAlreadyExist.status === "FAILED") {
      return res.status(500).json({
        message: "transaction processing failed",
      });
    }
    if (isTransactionAlreadyExist.status == "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  /**
   * check Account Status
   */

  if (
    fromUserAccount.status !== "Active" ||
    toUserAccount.status !== "Active"
  ) {
    return res.status(400).json({
      message: "Account must be Active",
    });
  }

  /**
   * Derive sender balance from ledger
   */

  const balance = await fromUserAccount.getBalance();

  if (balance < ammount) {
    return res.status(400).json({
      message: `Insufficent balance current balance is ${balance}. Requested ammount is ${ammount}`,
    });
  }

  try{

  /**
   * create transaction
   */
  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = (await transactionModel.create(
    [
      {
        fromAccount,
        toAccount,
        ammount,
        idempotencyKey,
        status: "PENDING",
      },
    ],
    { session },
  ))[0];

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromAccount,
        ammount: ammount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  await new Promise((resolve) => setTimeout(resolve, 30 * 1000));

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        ammount: ammount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  await transactionModel.findByIdAndUpdate(
    {_id: transaction._id },
    { status: "COMPLETED" },
    { session }
  )

  // const updatedTransaction = await transactionModel.findById(transaction[0]._id);

  await session.commitTransaction();
  session.endSession();
  
  /**
   * Send Email Notification
  */
 
 await emailService.sendTransactionNotificationEmail(
   req.user.email,
   req.user.name,
   ammount,
   fromAccount,
  );
  
  return res.status(201).json({
    message: "Transaction Successful",
    transaction: transaction,
  });
}catch(error){
  return res.status(500).json({
    message: "Transaction Failed or pending due to some error",
  });
}
};








const createInitialFundTransaction = async (req, res) => {
  const { toAccount, ammount, idempotencyKey } = req.body;
  if (!toAccount || !ammount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, ammount, idempotencyKey is important",
    });
  }
  //   console.log(toAccount);
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });
  //   console.log(toUserAccount);

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAcountt",
    });
  }
  //   console.log(req.user._id);
  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create(
    [
      {
        fromAccount: fromUserAccount._id,
        toAccount,
        ammount,
        idempotencyKey,
        status: "PENDING",
      },
    ],
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        ammount: ammount,
        transaction: transaction[0]._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        ammount: ammount,
        transaction: transaction[0]._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction[0].status = "COMPLETED";
  await transaction[0].save();
  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial Fund Transaction Successful",
    transaction: transaction[0],
  });
};

module.exports = { createTransaction, createInitialFundTransaction };
