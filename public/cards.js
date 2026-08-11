// =========================================
// MY CARDS
// =========================================

const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "/";
}

let cardLocked =
    localStorage.getItem("novaCardLocked") === "true";

let cardDetailsVisible = false;

let currentUser = null;


// =========================================
// LOAD USER
// =========================================

async function loadCardPage() {

    try {

        const response = await fetch(
            "/api/user/" + userId
        );

        const data = await response.json();

        console.log("Cards user:", data);


        if (!data.success || !data.user) {

            console.error(
                "Unable to load user:",
                data
            );

            return;
        }


        currentUser = data.user;


        // =====================================
        // ACCOUNT HOLDER NAME
        // =====================================

        const holders =
            document.querySelectorAll(
                "#cards-holder, #card-holder-name"
            );


        holders.forEach(function (element) {

            element.textContent =
                currentUser.fullName ||
                "Account Holder";

        });


        // =====================================
        // ACCOUNT NUMBER
        // =====================================

        updateCardNumber();


        // =====================================
        // CARD STATUS
        // =====================================

        updateCardStatus();

    }

    catch (error) {

        console.error(
            "Cards page error:",
            error
        );

    }

}


// =========================================
// ACCOUNT NUMBER
// =========================================

function updateCardNumber() {

    const cardNumber =
        document.getElementById(
            "card-number"
        );


    if (!cardNumber) {
        return;
    }


    const accountNumber =
        currentUser &&
        currentUser.accountNumber
            ? String(currentUser.accountNumber)
            : "";


    if (!accountNumber) {

        cardNumber.textContent =
            "Account number unavailable";

        return;
    }


    if (cardDetailsVisible) {

        cardNumber.textContent =
            accountNumber;

    }

    else {

        const lastFour =
            accountNumber.slice(-4);

        cardNumber.textContent =
            "•••• •••• •••• " +
            lastFour;

    }

}


// =========================================
// CARD STATUS
// =========================================

function updateCardStatus() {

    const status =
        document.querySelector(
            ".card-status"
        );

    const lockButton =
        document.getElementById(
            "lock-card-button"
        );


    if (status) {

        status.textContent =
            cardLocked
                ? "Locked"
                : "Active";


        status.classList.toggle(
            "card-locked",
            cardLocked
        );

    }


    if (lockButton) {

        lockButton.textContent =
            cardLocked
                ? "🔓 Unlock Card"
                : "🔒 Lock Card";

    }

}


// =========================================
// LOCK / UNLOCK
// =========================================

function toggleCardLock() {

    cardLocked = !cardLocked;


    localStorage.setItem(
        "novaCardLocked",
        cardLocked
    );


    updateCardStatus();


    alert(
        cardLocked
            ? "Your NOVA BANK card has been locked."
            : "Your NOVA BANK card has been unlocked."
    );

}


// =========================================
// VIEW / HIDE DETAILS
// =========================================

function toggleCardDetails() {

    cardDetailsVisible =
        !cardDetailsVisible;


    updateCardNumber();


    const detailsButton =
        document.getElementById(
            "details-button"
        );


    if (detailsButton) {

        detailsButton.textContent =
            cardDetailsVisible
                ? "🙈 Hide Details"
                : "👁 View Details";

    }

}


// =========================================
// START
// =========================================

loadCardPage();