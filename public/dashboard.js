// ==========================
// DASHBOARD.JS
// ==========================


// ==========================
// FORMAT MONEY
// ==========================

function formatMoney(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(amount) || 0);
}


// ==========================
// LOGGED-IN USER
// ==========================

const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "/";
}


// ==========================
// LOAD DASHBOARD
// ==========================

async function loadDashboard() {

    try {

        const response = await fetch(
            "/api/user/" + encodeURIComponent(userId)
        );

        if (!response.ok) {
            throw new Error(
                "Server returned " + response.status
            );
        }

        const data = await response.json();

        console.log("Dashboard user:", data);


        // --------------------------
        // CHECK USER
        // --------------------------

        if (!data.success || !data.user) {

            console.error(
                "Unable to load user:",
                data
            );

            return;
        }


        const user = data.user;


        // --------------------------
        // USER VALUES
        // --------------------------

        const fullName =
            user.fullName ||
            user.name ||
            "User";

        const balance =
            Number(user.balance) || 0;

        const accountNumber =
            user.accountNumber ||
            user.account_number ||
            "0000000000";

        const profileImage =
            user.profileImage ||
            user.profile_image ||
            "default-profile.png";


        console.log("User values:", {
            fullName,
            balance,
            accountNumber,
            profileImage
        });


        // ==========================
        // SAVE USER DATA
        // ==========================

        localStorage.setItem(
            "fullName",
            fullName
        );

        localStorage.setItem(
            "balance",
            balance
        );

        localStorage.setItem(
            "accountNumber",
            accountNumber
        );

        localStorage.setItem(
            "profileImage",
            profileImage
        );


        // ==========================
        // WELCOME NAME
        // ==========================

        const welcomeName =
            document.getElementById(
                "welcome-name"
            );

        if (welcomeName) {
            welcomeName.textContent =
                fullName;
        }


        // ==========================
        // DESKTOP PROFILE NAME
        // ==========================

        const profileName =
            document.getElementById(
                "profile-name"
            );

        if (profileName) {
            profileName.textContent =
                fullName;
        }


        // ==========================
        // MOBILE PROFILE NAME
        // ==========================

        const mobileProfileName =
            document.getElementById(
                "mobile-profile-name"
            );

        if (mobileProfileName) {
            mobileProfileName.textContent =
                fullName;
        }


        // ==========================
        // CARD HOLDER NAME
        // ==========================

        const cardName =
            document.getElementById(
                "card-name"
            );

        if (cardName) {
            cardName.textContent =
                fullName;
        }


        // ==========================
        // DESKTOP PROFILE IMAGE
        // ==========================

        const desktopProfileImage =
            document.getElementById(
                "profile-image"
            );

        if (desktopProfileImage) {

            desktopProfileImage.src =
                profileImage;

            desktopProfileImage.onerror =
                function () {

                    this.src =
                        "default-profile.png";

                };
        }


        // ==========================
        // MOBILE PROFILE IMAGE
        // ==========================

        const mobileProfileImage =
            document.getElementById(
                "mobile-profile-image"
            );

        if (mobileProfileImage) {

            mobileProfileImage.src =
                profileImage;

            mobileProfileImage.onerror =
                function () {

                    this.src =
                        "default-profile.png";

                };
        }


        // ==========================
        // BALANCE
        // ==========================

        const cardBalances =
            document.querySelectorAll(
                ".card-balance"
            );

        cardBalances.forEach(
            function (element) {

                element.textContent =
                    balance.toLocaleString(
                        "en-US",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );

            }
        );


        // ==========================
        // ACCOUNT NUMBER
        // ==========================

        const accountNumberElement =
            document.getElementById(
                "account-number"
            );

        if (accountNumberElement) {

            accountNumberElement.textContent =
                accountNumber;

        }


        // ==========================
        // FINISHED
        // ==========================

        console.log(
            "Dashboard updated successfully:",
            {
                userId: userId,
                name: fullName,
                balance: balance,
                accountNumber: accountNumber
            }
        );

    }

    catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


// ==========================
// MONTHLY SPENDING
// ==========================

function loadMonthlySpending(transactions) {

    const chart =
        document.getElementById("spending-chart");

    if (!chart) {
        return;
    }

    chart.innerHTML = "";

    const now = new Date();

    const months = [];

    // Get the last 6 months
    for (let i = 5; i >= 0; i--) {

        const date = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );

        months.push({
            year: date.getFullYear(),
            month: date.getMonth(),
            name: date.toLocaleDateString(
                "en-US",
                { month: "short" }
            ),
            amount: 0
        });
    }

    // Only spending transactions
    transactions.forEach(function (tx) {

        if (
            tx.type === "Deposit" ||
            tx.type === "Received"
        ) {
            return;
        }

        const date = new Date(tx.date);

        if (isNaN(date.getTime())) {
            return;
        }

        const amount =
            Math.abs(Number(tx.amount) || 0);

        months.forEach(function (item) {

            if (
                date.getFullYear() === item.year &&
                date.getMonth() === item.month
            ) {

                item.amount += amount;

            }

        });

    });

    // Find highest spending month
    const highest =
        Math.max(
            ...months.map(
                item => item.amount
            ),
            1
        );

    // Create bars
    months.forEach(function (item) {

        const bar =
            document.createElement("div");

        bar.className = "chart-bar";

        const span =
            document.createElement("span");

        const height =
            item.amount > 0
                ? Math.max(
                    (item.amount / highest) * 100,
                    5
                )
                : 0;

        span.style.height =
            height + "%";

        const label =
            document.createElement("small");

        label.textContent =
            item.name;

        bar.appendChild(span);
        bar.appendChild(label);

        chart.appendChild(bar);

    });

}
// ==========================
// LOAD TRANSACTIONS
// ==========================

async function loadTransactions() {

    try {

        const response = await fetch(
            "/api/transactions/" +
            encodeURIComponent(userId)
        );

        if (!response.ok) {
            throw new Error(
                "Server returned " + response.status
            );
        }

        const data =
            await response.json();

        console.log(
            "Dashboard transactions:",
            data
        );


        const table =
            document.getElementById(
                "transaction-table"
            );


        if (!table) {

            console.error(
                "transaction-table not found."
            );

            return;
        }


        table.innerHTML = "";


        if (
            !data.success ||
            !Array.isArray(
                data.transactions
            ) ||
            data.transactions.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No transactions yet.
                    </td>
                </tr>
            `;

            return;
        }


        const transactions =
            [...data.transactions].reverse();


        transactions.forEach(
            function (tx) {

                const row =
                    document.createElement(
                        "tr"
                    );


                // --------------------------
                // PERSON
                // --------------------------

                const personCell =
                    document.createElement(
                        "td"
                    );

                let person =
                    "Transaction";


                if (
                    tx.type ===
                    "Deposit"
                ) {

                    person =
                        "Admin Deposit";

                }

                else if (
                    tx.type ===
                    "Received"
                ) {

                    person =
                        tx.sender ||
                        "Received";

                }

                else {

                    person =
                        tx.recipient ||
                        "Transfer";

                }


                personCell.textContent =
                    person;


                // --------------------------
                // DATE
                // --------------------------

                const dateCell =
                    document.createElement(
                        "td"
                    );

                dateCell.textContent =
                    tx.date
                        ? new Date(
                            tx.date
                        ).toLocaleDateString(
                            "en-US"
                        )
                        : "Unknown";


          
// --------------------------
// STATUS
// --------------------------

const statusCell =
    document.createElement("td");

const badge =
    document.createElement("span");


// Check Pending FIRST
if (tx.status === "Pending") {

    badge.textContent = "Pending";

    badge.className = "pending";

}


// Received
else if (tx.type === "Received") {

    badge.textContent = "Received";

    badge.className = "success";

}


// Deposit
else if (tx.type === "Deposit") {

    badge.textContent = "Deposit";

    badge.className = "success";

}


// Transfer
else {

    badge.textContent = "Sent";

    badge.className = "pending";

}


statusCell.appendChild(badge);


                // --------------------------
                // AMOUNT
                // --------------------------

                const amountCell =
                    document.createElement(
                        "td"
                    );

                const amount =
                    Number(
                        tx.amount
                    ) || 0;


                amountCell.textContent =
                    formatMoney(amount);

                amountCell.style.fontWeight =
                    "bold";


                if (amount < 0) {

                    amountCell.style.color =
                        "#dc2626";

                }

                else {

                    amountCell.style.color =
                        "#16a34a";

                }


                // --------------------------
                // ADD CELLS
                // --------------------------

                row.appendChild(
                    personCell
                );

                row.appendChild(
                    dateCell
                );

                row.appendChild(
                    statusCell
                );

                row.appendChild(
                    amountCell
                );


                // --------------------------
                // TRANSACTION CLICK
                // --------------------------

                row.style.cursor =
                    "pointer";


                row.addEventListener(
                    "click",
                    function () {

                        localStorage.setItem(
                            "selectedTransaction",
                            JSON.stringify(tx)
                        );

                        window.location.href =
                            "transaction.html";

                    }
                );


                table.appendChild(
                    row
                );

            }
        );


        console.log(
            "Transactions displayed:",
            transactions.length
        );
loadMonthlySpending(transactions);
    }

    catch (error) {

        console.error(
            "Transaction loading error:",
            error
        );

    }

}


// ==========================
// DEPOSIT
// ==========================

async function deposit() {

    const amountInput =
        document.getElementById(
            "deposit-amount"
        );


    if (!amountInput) {
        return;
    }


    const amount =
        parseFloat(
            amountInput.value
        );


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
                "/api/deposit",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            userId,

                        amount:
                            amount

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Deposit response:",
            data
        );


        if (!data.success) {

            alert(
                data.message ||
                "Deposit failed."
            );

            return;
        }


        amountInput.value = "";


        alert(
            "Deposit Successful!"
        );


        await loadDashboard();

        await loadTransactions();

    }

    catch (error) {

        console.error(
            "Deposit error:",
            error
        );

        alert(
            "Unable to process deposit."
        );

    }

}


// ==========================
// LOGOUT
// ==========================

function logout() {

    localStorage.removeItem(
        "userId"
    );

    localStorage.removeItem(
        "fullName"
    );

    localStorage.removeItem(
        "balance"
    );

    localStorage.removeItem(
        "accountNumber"
    );

    localStorage.removeItem(
        "profileImage"
    );

    localStorage.removeItem(
        "role"
    );


    window.location.href = "/";
}


// ==========================
// START DASHBOARD
// ==========================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadDashboard();
        await loadTransactions();

        // Make the dashboard bank card clickable
        const bankCard =
            document.querySelector(".bank-card");

        if (bankCard) {

            bankCard.style.cursor = "pointer";

            bankCard.addEventListener(
                "click",
                function () {

                    window.location.href = "cards.html";

                }
            );

        }

    }
);