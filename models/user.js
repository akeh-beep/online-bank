const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    profileImage: {
        type: String,
        default: "default-profile.png"
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    accountNumber: {
        type: String,
        unique: true
    },

    balance: {
        type: Number,
        default: 5000
    },

    transactions: [
        {
            type: {
                type: String
            },

            status: {
                type: String,
                enum: [
                    "Pending",
                    "Completed",
                    "Failed",
                    "Cancelled"
                ],
                default: "Completed"
            },

            sender: {
                type: String
            },

            senderAccount: {
                type: String
            },

            recipient: {
                type: String
            },

            recipientAccount: {
                type: String
            },

            amount: {
                type: Number
            },

            description: {
                type: String
            },

            date: {
                type: Date,
                default: Date.now
            }
        }
    ]

});

module.exports = mongoose.model("User", userSchema);