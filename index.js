const express = require("express");
const path = require("path");
require("./models/database");

const bcrypt = require("bcrypt");
const User = require("./models/user");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

console.log(__dirname);


// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", async (req, res) => {

    try {

        const { username, password } = req.body;

       const user = await User.findOne({
    $or: [
        { username: username },
        { email: username }
    ]
});
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.json({
                success: false,
                message: "Incorrect password"
            });
        }

        res.json({
            success: true,
            userId: user._id,
            fullName: user.fullName,
            balance: user.balance,
            accountNumber: user.accountNumber,
            profileImage: user.profileImage,
            role: user.role || "user"
        });

    } catch (err) {

        console.log("LOGIN ERROR:", err);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});


// ======================================================
// GET USER
// ======================================================

app.get("/api/user/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        res.json({

            success: true,

            user: {
                fullName: user.fullName,
                email: user.email,
                accountNumber: user.accountNumber,
                balance: user.balance,
                profileImage: user.profileImage,
                transactions: user.transactions
            }

        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});


// ======================================================
// USER TRANSACTIONS
// ======================================================

app.get("/api/transactions/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            transactions: user.transactions
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});


// ======================================================
// UPDATE PROFILE
// ======================================================

app.put("/api/profile", async (req, res) => {

    try {

        const {
            userId,
            fullName,
            email,
            password,
            profileImage
        } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        const existingUser = await User.findOne({
            email: email,
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.json({
                success: false,
                message: "That email is already being used."
            });
        }

        user.fullName = fullName;
        user.email = email;

        if (profileImage) {
            user.profileImage = profileImage;
        }

        if (password && password.trim() !== "") {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.json({

            success: true,

            message: "Profile updated successfully!",

            user: {
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage
            }

        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});


// ======================================================
// CHANGE PASSWORD
// ======================================================

app.put("/api/change-password", async (req, res) => {

    try {

        const {
            userId,
            currentPassword,
            newPassword
        } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.json({
                success: false,
                message: "All password fields are required."
            });
        }

        if (newPassword.length < 6) {
            return res.json({
                success: false,
                message: "New password must be at least 6 characters."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        user.password =
            await bcrypt.hash(newPassword, 10);

        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (err) {

        console.log("CHANGE PASSWORD ERROR:", err);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});


// ======================================================
// REGISTER
// ======================================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            fullName,
            username,
            email,
            password
        } = req.body;

        const existingUser = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (existingUser) {
            return res.json({
                success: false,
                message: "Username or email already exists."
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const accountNumber =
            Math.floor(
                1000000000 +
                Math.random() * 9000000000
            ).toString();

        const user = new User({

            fullName,
            username,
            email,
            password: hashedPassword,
            accountNumber,
            balance: 5000

        });

        await user.save();

        res.json({
            success: true,
            message: "Account created successfully!"
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});


// ======================================================
// FIND RECIPIENT
// ======================================================

app.get("/api/account/:accountNumber", async (req, res) => {

    try {

        const user = await User.findOne({
            accountNumber: req.params.accountNumber
        });

        if (!user) {
            return res.json({
                success: false
            });
        }

        res.json({
            success: true,
            fullName: user.fullName
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});


// ======================================================
// TRANSFER MONEY
// ======================================================
// Transfer does NOT move money immediately.
// It creates a Pending transaction for admin approval.
// ======================================================

app.post("/api/transfer", async (req, res) => {

    try {

        const {
            senderId,
            recipientAccount,
            amount,
            description
        } = req.body;


        // FIND SENDER

        const sender =
            await User.findById(senderId);

        if (!sender) {
            return res.json({
                success: false,
                message: "Sender not found."
            });
        }


        // FIND RECIPIENT

        const recipient =
            await User.findOne({
                accountNumber: recipientAccount
            });

        if (!recipient) {
            return res.json({
                success: false,
                message: "Recipient account not found."
            });
        }


        // PREVENT SELF TRANSFER

        if (
            sender.accountNumber ===
            recipient.accountNumber
        ) {

            return res.json({
                success: false,
                message:
                    "You cannot transfer money to yourself."
            });

        }


        // VALIDATE AMOUNT

        const transferAmount =
            Number(amount);

        if (
            !Number.isFinite(transferAmount) ||
            transferAmount <= 0
        ) {

            return res.json({
                success: false,
                message: "Invalid amount."
            });

        }


        // CHECK BALANCE

        if (
            Number(sender.balance) <
            transferAmount
        ) {

            return res.json({
                success: false,
                message: "Insufficient balance."
            });

        }


        // CREATE PENDING TRANSACTION

        sender.transactions.push({

            type: "Transfer",

            status: "Pending",

            sender: sender.fullName,

            senderAccount:
                sender.accountNumber,

            recipient:
                recipient.fullName,

            recipientAccount:
                recipient.accountNumber,

            amount:
                -transferAmount,

            description:
                description || "Money transfer",

            date: new Date()

        });


        await sender.save();


        res.json({

            success: true,

            message:
                "Transfer submitted for admin approval.",

            status: "Pending",

            newBalance:
                sender.balance

        });

    } catch (err) {

        console.log(
            "TRANSFER ERROR:",
            err
        );

        res.json({
            success: false,
            message: "Server Error"
        });

    }

});


// ======================================================
// ADMIN GET USERS
// ======================================================

app.get("/api/admin/users/:adminId", async (req, res) => {
    try {
        console.log("=================================");
        console.log("ADMIN USERS REQUEST");
        console.log("Admin ID:", req.params.adminId);

        const admin = await User.findById(req.params.adminId);

        console.log(
            "Admin found:",
            admin ? admin.fullName : "NO"
        );

        console.log(
            "Admin role:",
            admin ? admin.role : "NO ADMIN"
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found."
            });
        }

        if (admin.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });
        }

        // Get all normal users.
        // This also includes older accounts that were
        // created before the role field was added.
        const users = await User.find(
            {
                $or: [
                    { role: "user" },
                    { role: { $exists: false } }
                ]
            },
            "_id fullName accountNumber balance role"
        );

        console.log(
            "USERS FOUND:",
            users.length
        );

        console.log(
            "USERS:",
            users.map(user => ({
                id: user._id,
                name: user.fullName,
                account: user.accountNumber,
                balance: user.balance,
                role: user.role
            }))
        );

        return res.json({
            success: true,
            users: users
        });

    } catch (error) {

        console.error(
            "ADMIN USERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load users.",
            error: error.message
        });
    }
});

// ======================================================
// ADMIN DEPOSIT
// ======================================================

app.post("/api/admin/deposit", async (req, res) => {

    try {

        const {
            adminId,
            userId,
            amount,
            description
        } = req.body;


        const admin =
            await User.findById(adminId);

        if (
            !admin ||
            admin.role !== "admin"
        ) {

            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });

        }


        const user =
            await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }


        const depositAmount =
            Number(amount);

        if (
            !Number.isFinite(depositAmount) ||
            depositAmount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid deposit amount."
            });

        }


        // CREDIT USER

        user.balance += depositAmount;


        // RECORD TRANSACTION

        user.transactions.push({

            type: "Deposit",

            status: "Completed",

            sender:
                admin.fullName,

            senderAccount:
                admin.accountNumber,

            recipient:
                user.fullName,

            recipientAccount:
                user.accountNumber,

            amount:
                depositAmount,

            description:
                description ||
                "Admin deposit",

            date:
                new Date()

        });


        await user.save();


        res.json({

            success: true,

            message:
                "Deposit successful.",

            newBalance:
                user.balance,

            status:
                "Completed"

        });

    } catch (err) {

        console.log(
            "ADMIN DEPOSIT ERROR:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                "Server Error"

        });

    }

});


// ======================================================
// ADMIN GET TRANSACTIONS
// ======================================================

app.get(
    "/api/admin/transactions/:adminId",
    async (req, res) => {

        try {

            const {
                adminId
            } = req.params;


            const admin =
                await User.findById(adminId);

            if (
                !admin ||
                admin.role !== "admin"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Admin access required."

                });

            }


            const users =
                await User.find(
                    { role: "user" },
                    "fullName accountNumber transactions"
                );


            const transactions = [];


            users.forEach(user => {

                if (!user.transactions) {
                    return;
                }


                user.transactions.forEach(
                    transaction => {

                        transactions.push({

                            transactionId:
                                transaction._id,

                            user:
                                user.fullName,

                            accountNumber:
                                user.accountNumber,

                            type:
                                transaction.type,

                            status:
                                transaction.status ||
                                "Completed",

                            amount:
                                transaction.amount,

                            description:
                                transaction.description,

                            sender:
                                transaction.sender,

                            recipient:
                                transaction.recipient,

                            recipientAccount:
                                transaction.recipientAccount,

                            date:
                                transaction.date

                        });

                    }
                );

            });


            transactions.sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


            res.json({

                success: true,

                transactions

            });

        } catch (error) {

            console.error(
                "Admin transactions error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to load transactions."

            });

        }

    }
);


// ======================================================
// ADMIN APPROVE TRANSFER
// ======================================================

app.post(
    "/api/admin/transactions/:adminId/:transactionId/approve",
    async (req, res) => {

        try {

            const {
                adminId,
                transactionId
            } = req.params;


            // CHECK ADMIN

            const admin =
                await User.findById(adminId);

            if (
                !admin ||
                admin.role !== "admin"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Admin access required."

                });

            }


            // FIND SENDER

            const sender =
                await User.findOne({

                    "transactions._id":
                        transactionId

                });


            if (!sender) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Pending transaction not found."

                });

            }


            // FIND TRANSACTION

            const transaction =
                sender.transactions.id(
                    transactionId
                );


            if (!transaction) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Transaction not found."

                });

            }


            // CHECK STATUS

            if (
                transaction.status !==
                "Pending"
            ) {

                return res.json({

                    success: false,

                    message:
                        "This transaction has already been processed."

                });

            }


            // FIND RECIPIENT

            const recipient =
                await User.findOne({

                    accountNumber:
                        transaction.recipientAccount

                });


            if (!recipient) {

                return res.json({

                    success: false,

                    message:
                        "Recipient account no longer exists."

                });

            }


            // GET TRANSFER AMOUNT

            const transferAmount =
                Math.abs(
                    Number(
                        transaction.amount
                    )
                );


            // CHECK SENDER BALANCE AGAIN

            if (
                Number(sender.balance) <
                transferAmount
            ) {

                transaction.status =
                    "Failed";

                await sender.save();

                return res.json({

                    success: false,

                    message:
                        "Sender no longer has enough balance."

                });

            }


            // DEDUCT SENDER

            sender.balance -=
                transferAmount;


            // MARK SENDER TRANSACTION COMPLETE

            transaction.status =
                "Completed";


            // CREATE RECIPIENT TRANSACTION

            recipient.transactions.push({

                type: "Received",

                status: "Completed",

                sender:
                    sender.fullName,

                senderAccount:
                    sender.accountNumber,

                recipient:
                    recipient.fullName,

                recipientAccount:
                    recipient.accountNumber,

                amount:
                    transferAmount,

                description:
                    transaction.description ||
                    "Money received",

                date:
                    new Date()

            });


            // SAVE BOTH

            await sender.save();

            await recipient.save();


            res.json({

                success: true,

                message:
                    "Transfer approved successfully.",

                status:
                    "Completed",

                senderBalance:
                    sender.balance

            });

        } catch (error) {

            console.error(
                "APPROVE TRANSFER ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to approve transfer."

            });

        }

    }
);


// ======================================================
// ADMIN REJECT TRANSFER
// ======================================================

app.post(
    "/api/admin/transactions/:adminId/:transactionId/reject",
    async (req, res) => {

        try {

            const {
                adminId,
                transactionId
            } = req.params;


            // CHECK ADMIN

            const admin =
                await User.findById(adminId);

            if (
                !admin ||
                admin.role !== "admin"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Admin access required."

                });

            }


            // FIND SENDER

            const sender =
                await User.findOne({

                    "transactions._id":
                        transactionId

                });


            if (!sender) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Transaction not found."

                });

            }


            const transaction =
                sender.transactions.id(
                    transactionId
                );


            if (!transaction) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Transaction not found."

                });

            }


            // ONLY PENDING CAN BE REJECTED

            if (
                transaction.status !==
                "Pending"
            ) {

                return res.json({

                    success: false,

                    message:
                        "This transaction has already been processed."

                });

            }


            // CANCEL IT

            transaction.status =
                "Cancelled";


            await sender.save();


            res.json({

                success: true,

                message:
                    "Transfer rejected.",

                status:
                    "Cancelled"

            });

        } catch (error) {

            console.error(
                "REJECT TRANSFER ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to reject transfer."

            });

        }

    }
);


// ======================================================
// CREATE ADMIN
// ======================================================

app.post("/api/create-admin", async (req, res) => {

    try {

        const {
            fullName,
            username,
            email,
            password
        } = req.body;


        if (
            !fullName ||
            !username ||
            !email ||
            !password
        ) {

            return res.json({

                success: false,

                message:
                    "All fields are required."

            });

        }


        const existingUser =
            await User.findOne({

                $or: [
                    { username },
                    { email }
                ]

            });


        if (existingUser) {

            return res.json({

                success: false,

                message:
                    "Username or email already exists."

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const accountNumber =
            Math.floor(
                1000000000 +
                Math.random() *
                9000000000
            ).toString();


        const admin =
            new User({

                fullName,

                username,

                email,

                password:
                    hashedPassword,

                role:
                    "admin",

                accountNumber,

                balance:
                    0

            });


        await admin.save();


        res.json({

            success: true,

            message:
                "Admin account created successfully."

        });

    } catch (err) {

        console.log(
            "CREATE ADMIN ERROR:",
            err
        );

        res.json({

            success: false,

            message:
                "Server Error"

        });

    }

});


// ======================================================
// HOME PAGE
// ======================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

    console.log(
        `✅ Bank server running on http://localhost:${PORT}`
    );

});