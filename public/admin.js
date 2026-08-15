 
const adminId = localStorage.getItem("userId");
const role = localStorage.getItem("role");

console.log("ADMIN JS LOADED");
console.log("Admin ID:", adminId);
console.log("Role:", role);

// ======================
// Admin Access Check
// ======================

if (!adminId || role !== "admin") {

    alert("Admin access required.");

    window.location.href = "/";

}

// ======================
// Format Money
// ======================

function formatMoney(amount) {

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(amount) || 0);

}

// ======================
// Load Admin
// ======================

async function loadAdmin() {

    try {

        const response = await fetch(
            "/api/user/" + adminId
        );

        const data = await response.json();

        console.log("Admin response:", data);

        if (!data.success) {
            return;
        }

        const adminName =
            document.getElementById("admin-name");

        if (adminName) {

            adminName.innerText =
                data.user.fullName;

        }

    } catch (error) {

        console.error(
            "Admin loading error:",
            error
        );

    }

}

// ======================
// Load Users
// ======================

async function loadUsers() {

    console.log("Loading users...");

    try {

        const response = await fetch(
            "/api/admin/users/" + adminId
        );

        if (!response.ok) {

            throw new Error(
                "Server returned " + response.status
            );

        }

        const data = await response.json();

        console.log(
            "Admin users response:",
            data
        );

        if (!data.success) {

            alert(
                data.message ||
                "Unable to load users."
            );

            return;

        }

        const select =
            document.getElementById("user-select");

        const table =
            document.getElementById("user-table");

        if (!select) {

            console.error(
                "user-select element not found"
            );

            return;

        }

        if (!table) {

            console.error(
                "user-table element not found"
            );

            return;

        }

        // Clear dropdown

        select.innerHTML = "";

        // Default option

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            "Select a user";

        select.appendChild(
            defaultOption
        );

        // Clear users table

        table.innerHTML = "";

        // Make sure users is an array

        if (!Array.isArray(data.users)) {

            console.error(
                "data.users is not an array:",
                data.users
            );

            return;

        }

        // Add users

        data.users.forEach(function (user) {

            console.log(
                "Adding user:",
                user
            );

            // Dropdown option

            const option =
                document.createElement("option");

            option.value =
                user._id;

            option.textContent =
                user.fullName +
                " — " +
                user.accountNumber;

            select.appendChild(
                option
            );

            // User table row

            const row =
                document.createElement("tr");

            const nameCell =
                document.createElement("td");

            nameCell.textContent =
                user.fullName;

            const accountCell =
                document.createElement("td");

            accountCell.textContent =
                user.accountNumber;

            const balanceCell =
                document.createElement("td");

            balanceCell.textContent =
                formatMoney(user.balance);

            row.appendChild(
                nameCell
            );

            row.appendChild(
                accountCell
            );

            row.appendChild(
                balanceCell
            );

            table.appendChild(
                row
            );

        });

        console.log(
            "Users loaded successfully."
        );

    } catch (error) {

        console.error(
            "Load users error:",
            error
        );

    }

}


async function loadTransactions() {

    console.log("Loading transactions...");

    try {

        const response = await fetch(
            "/api/admin/transactions/" + adminId
        );

        if (!response.ok) {
            throw new Error(
                "Server returned " + response.status
            );
        }

        const data = await response.json();

        console.log(
            "Transactions response:",
            data
        );

        const table =
            document.getElementById(
                "admin-transaction-table"
            );

        if (!table) {
            console.error(
                "admin-transaction-table not found"
            );
            return;
        }

        table.innerHTML = "";

        if (
            !data.success ||
            !Array.isArray(data.transactions) ||
            data.transactions.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="8">
                        No transactions found.
                    </td>
                </tr>
            `;

            return;
        }


        data.transactions.forEach(
            function (transaction) {

                const row =
                    document.createElement("tr");


                // USER

                const userCell =
                    document.createElement("td");

                userCell.textContent =
                    transaction.user || "Unknown";


                // ACCOUNT NUMBER

                const accountCell =
                    document.createElement("td");

                accountCell.textContent =
                    transaction.accountNumber ||
                    "Unknown";


                // TYPE

                const typeCell =
                    document.createElement("td");

                typeCell.textContent =
                    transaction.type ||
                    "Transaction";


                // AMOUNT

                const amountCell =
                    document.createElement("td");

                const amount =
                    Number(transaction.amount) || 0;

                amountCell.textContent =
                    "$" +
                    Math.abs(amount).toLocaleString(
                        "en-US",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );


                // STATUS

                const statusCell =
                    document.createElement("td");

                const statusBadge =
                    document.createElement("span");

                let status =
                    String(
                        transaction.status ||
                        "Completed"
                    )
                    .trim()
                    .toLowerCase();


                if (status === "pending") {

                    statusBadge.textContent =
                        "Pending";

                    statusBadge.className =
                        "transaction-status pending";

                } else if (status === "failed") {

                    statusBadge.textContent =
                        "Failed";

                    statusBadge.className =
                        "transaction-status failed";

                } else if (
                    status === "cancelled" ||
                    status === "canceled"
                ) {

                    statusBadge.textContent =
                        "Cancelled";

                    statusBadge.className =
                        "transaction-status cancelled";

                } else {

                    statusBadge.textContent =
                        "Completed";

                    statusBadge.className =
                        "transaction-status completed";

                }

                statusCell.appendChild(
                    statusBadge
                );


                // DESCRIPTION

                const descriptionCell =
                    document.createElement("td");

                descriptionCell.textContent =
                    transaction.description ||
                    "No description";


                // DATE

                const dateCell =
                    document.createElement("td");

                dateCell.textContent =
                    transaction.date
                        ? new Date(
                            transaction.date
                        ).toLocaleString("en-US")
                        : "Unknown";


                // ACTION

                const actionCell =
                    document.createElement("td");


                if (status === "pending") {

                    const approveButton =
                        document.createElement("button");

                    approveButton.type = "button";
                    approveButton.textContent =
                        "Approve";

                    approveButton.className =
                        "approve-btn";

                    approveButton.onclick =
                        function () {

                            approveTransaction(
                                transaction.transactionId
                            );

                        };


                    const rejectButton =
                        document.createElement("button");

                    rejectButton.type = "button";
                    rejectButton.textContent =
                        "Reject";

                    rejectButton.className =
                        "reject-btn";

                    rejectButton.onclick =
                        function () {

                            rejectTransaction(
                                transaction.transactionId
                            );

                        };


                    actionCell.appendChild(
                        approveButton
                    );

                    actionCell.appendChild(
                        rejectButton
                    );

                } else {

                    actionCell.textContent =
                        transaction.status ||
                        "Completed";

                }


                // ADD EACH CELL ONCE

                row.appendChild(userCell);
                row.appendChild(accountCell);
                row.appendChild(typeCell);
                row.appendChild(amountCell);
                row.appendChild(statusCell);
                row.appendChild(descriptionCell);
                row.appendChild(dateCell);
                row.appendChild(actionCell);


                table.appendChild(row);

            }
        );


        console.log(
            "Transactions displayed:",
            data.transactions.length
        );


    } catch (error) {

        console.error(
            "Load transactions error:",
            error
        );

    }

}


async function approveTransaction(transactionId) {

    if (!confirm("Approve this transfer?")) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/admin/transactions/${adminId}/${transactionId}/approve`,
                {
                    method: "POST"
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            alert(
                data.message ||
                "Unable to approve transfer."
            );

            return;
        }

        alert(
            "Transfer approved successfully."
        );

        await loadTransactions();
        await loadUsers();

    } catch (error) {

        console.error(
            "Approve transaction error:",
            error
        );

        alert(
            "Unable to approve transfer."
        );

    }

}


async function rejectTransaction(transactionId) {

    if (!confirm("Reject this transfer?")) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/admin/transactions/${adminId}/${transactionId}/reject`,
                {
                    method: "POST"
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            alert(
                data.message ||
                "Unable to reject transfer."
            );

            return;
        }

        alert(
            "Transfer rejected."
        );

        await loadTransactions();

    } catch (error) {

        console.error(
            "Reject transaction error:",
            error
        );

        alert(
            "Unable to reject transfer."
        );

    }

}

// ======================
// Admin Deposit
// ======================

async function adminDeposit() {

    const select =
        document.getElementById(
            "user-select"
        );

    const amountInput =
        document.getElementById(
            "deposit-amount"
        );

    const descriptionInput =
        document.getElementById(
            "deposit-description"
        );

    const message =
        document.getElementById(
            "deposit-message"
        );

    if (
        !select ||
        !amountInput ||
        !descriptionInput ||
        !message
    ) {

        console.error(
            "Deposit elements missing."
        );

        return;

    }

    const selectedUserId =
        select.value;

    const amount =
        Number(amountInput.value);

    const description =
        descriptionInput.value.trim();

    if (!selectedUserId) {

        message.innerText =
            "Please select a user.";

        return;

    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        message.innerText =
            "Please enter a valid amount.";

        return;

    }

    try {

        const response =
            await fetch(
                "/api/admin/deposit",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        adminId:
                            adminId,

                        userId:
                            selectedUserId,

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
            "Deposit response:",
            data
        );

        if (!data.success) {

            message.innerText =
                data.message ||
                "Deposit failed.";

            return;

        }

        message.innerText =
            "Deposit successful!";

        amountInput.value = "";

        descriptionInput.value = "";

        await loadUsers();

        await loadTransactions();

    } catch (error) {

        console.error(
            "Deposit error:",
            error
        );

        message.innerText =
            "Unable to process deposit.";

    }

}

// ======================
// Logout
// ======================

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

// ======================
// Start Admin Dashboard
// ======================

loadAdmin();

loadUsers();

loadTransactions();
