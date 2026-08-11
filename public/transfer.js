// ==========================
// TRANSFER.JS
// ==========================

function formatMoney(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(amount) || 0);
}


// ==========================
// GET LOGGED-IN USER
// ==========================

const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "/";
}


// ==========================
// LOAD USER FROM SERVER
// ==========================

async function loadTransferUser() {

    try {

        const response = await fetch(
            "/api/user/" + userId,
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        console.log("TRANSFER USER DATA:", data);

        if (!data.success || !data.user) {
            alert(data.message || "Unable to load account.");
            return;
        }

        const user = data.user;


        // ==========================
        // NAME
        // ==========================

        const senderName =
            document.getElementById("sender-name");

        if (senderName) {
            senderName.textContent =
                user.fullName || "User";
        }


        // ==========================
        // ACCOUNT NUMBER
        // ==========================

        const senderAccount =
            document.getElementById("sender-account");

        if (senderAccount) {
            senderAccount.textContent =
                user.accountNumber || "—";
        }


        // ==========================
        // BALANCE
        // ==========================

        const senderBalance =
            document.getElementById("sender-balance");

        if (senderBalance) {

            senderBalance.textContent =
                formatMoney(user.balance);

        }


        // ==========================
        // PROFILE NAME
        // ==========================

        const profileName =
            document.getElementById("profile-name");

        if (profileName) {

            profileName.textContent =
                user.fullName || "User";

        }


        // ==========================
        // PROFILE IMAGE
        // ==========================

        const profileImage =
            document.getElementById("profile-image");

        if (
            profileImage &&
            user.profileImage
        ) {

            profileImage.src =
                user.profileImage;

        }


        // ==========================
        // SYNC LOCAL STORAGE
        // ==========================

        localStorage.setItem(
            "fullName",
            user.fullName || ""
        );

        localStorage.setItem(
            "balance",
            String(user.balance ?? 0)
        );

        localStorage.setItem(
            "accountNumber",
            user.accountNumber || ""
        );

        localStorage.setItem(
            "profileImage",
            user.profileImage || ""
        );


        console.log(
            "Transfer page updated:",
            {
                name: user.fullName,
                account: user.accountNumber,
                balance: user.balance
            }
        );

    }

    catch (error) {

        console.error(
            "Transfer user loading error:",
            error
        );

    }

}


// ==========================
// CHECK RECIPIENT
// ==========================

async function checkRecipient() {

    const recipientInput =
        document.getElementById("recipient");

    const recipientName =
        document.getElementById("recipient-name");


    if (
        !recipientInput ||
        !recipientName
    ) {
        return;
    }


    const account =
        recipientInput.value.trim();


    if (account.length < 10) {

        recipientName.textContent = "";

        return;

    }


    try {

        const response =
            await fetch(
                "/api/account/" +
                encodeURIComponent(account)
            );

        const data =
            await response.json();


        if (data.success) {

            recipientName.textContent =
                "✔ " +
                (data.fullName || "Account found");

            recipientName.className =
                "success";

        }

        else {

            recipientName.textContent =
                "Account not found";

            recipientName.className =
                "error";

        }

    }

    catch (error) {

        console.error(
            "Recipient lookup error:",
            error
        );

        recipientName.textContent =
            "Unable to check account.";

        recipientName.className =
            "error";

    }

}


// ==========================
// TRANSFER MONEY
// ==========================

async function transferMoney() {

    const senderId =
        localStorage.getItem("userId");


    const recipientElement =
        document.getElementById("recipient");

    const amountElement =
        document.getElementById("amount");

    const descriptionElement =
        document.getElementById("description");


    if (!senderId) {

        alert("Please login again.");

        window.location.href = "/";

        return;

    }


    if (
        !recipientElement ||
        !amountElement
    ) {

        alert("Transfer form is incomplete.");

        return;

    }


    const recipientAccount =
        recipientElement.value.trim();

    const amount =
        Number(amountElement.value);

    const description =
        descriptionElement
            ? descriptionElement.value.trim()
            : "";


    if (!recipientAccount) {

        alert(
            "Please enter a recipient account."
        );

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/transfer",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        senderId:
                            senderId,

                        recipientAccount:
                            recipientAccount,

                        amount:
                            amount,

                        description:
                            description

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Transfer response:",
            data
        );


        if (data.success) {

            if (
                data.balance !== undefined
            ) {

                localStorage.setItem(
                    "balance",
                    String(data.balance)
                );

            }

            alert(
                "Transfer successful."
            );

            window.location.href =
                "dashboard.html";

            return;

        }


        alert(
            data.message ||
            "Transfer failed."
        );

    }

    catch (error) {

        console.error(
            "Transfer error:",
            error
        );

        alert(
            "Unable to complete transfer."
        );

    }

}


// ==========================
// START
// ==========================

loadTransferUser();