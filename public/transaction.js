function formatMoney(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(amount));
}

const tx = JSON.parse(localStorage.getItem("selectedTransaction"));
console.log("SELECTED TRANSACTION:", tx);
if (!tx) {
    window.location.href = "dashboard.html";
}

document.getElementById("reference").innerText =
    tx._id || "N/A";

document.getElementById("type").innerText =
    tx.type || "N/A";

document.getElementById("status").innerText =
    "Completed";

document.getElementById("sender").innerText =
    tx.sender || "-";

document.getElementById("recipient").innerText =
    tx.recipient || "-";

document.getElementById("amount").innerText =
    formatMoney(tx.amount);

document.getElementById("description").innerText =
    tx.description || "-";

document.getElementById("date").innerText =
    new Date(tx.date).toLocaleString("en-US");