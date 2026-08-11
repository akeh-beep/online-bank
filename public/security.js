// ==========================================
// LOAD USER INFORMATION
// ==========================================

const userId = localStorage.getItem("userId");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!userId) {

    window.location.href = "index.html";

}


// ==========================================
// LOAD USER
// ==========================================

async function loadUser() {

    try {

        const response = await fetch(
            `/api/user/${userId}`
        );

        const data = await response.json();

        if (!data.success) {

            localStorage.clear();

            window.location.href = "index.html";

            return;
        }

        const user = data.user;
const profileImage =
    document.getElementById("profile-image");

if (profileImage && user.profileImage) {
    profileImage.src = user.profileImage;
}


const mobileProfileImage =
    document.getElementById(
        "mobile-profile-image"
    );

if (
    mobileProfileImage &&
    user.profileImage
) {
    mobileProfileImage.src =
        user.profileImage;
}

        // Desktop name
        const profileName =
            document.getElementById("profile-name");

        if (profileName) {
            profileName.textContent =
                user.fullName;
        }


        // Mobile name
        const mobileName =
            document.getElementById(
                "mobile-profile-name"
            );

        if (mobileName) {
            mobileName.textContent =
                user.fullName;
        }


    } catch (error) {

        console.error(
            "LOAD USER ERROR:",
            error
        );

    }

}


// ==========================================
// CHANGE PASSWORD
// ==========================================

async function changePassword() {

    const currentPassword =
        document.getElementById(
            "current-password"
        ).value.trim();

    const newPassword =
        document.getElementById(
            "new-password"
        ).value.trim();

    const confirmPassword =
        document.getElementById(
            "confirm-password"
        ).value.trim();

    const message =
        document.getElementById(
            "password-message"
        );


    // Clear old message

    message.textContent = "";

    message.className =
        "password-message";


    // ======================================
    // VALIDATION
    // ======================================

    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        message.textContent =
            "Please fill in all password fields.";

        message.classList.add("error");

        return;
    }


    if (newPassword.length < 6) {

        message.textContent =
            "New password must be at least 6 characters.";

        message.classList.add("error");

        return;
    }


    if (newPassword !== confirmPassword) {

        message.textContent =
            "New passwords do not match.";

        message.classList.add("error");

        return;
    }


    if (currentPassword === newPassword) {

        message.textContent =
            "Your new password must be different from your current password.";

        message.classList.add("error");

        return;
    }


    // ======================================
    // SEND TO SERVER
    // ======================================

    try {

        const response = await fetch(
            "/api/change-password",
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    userId,

                    currentPassword,

                    newPassword

                })
            }
        );


        const data =
            await response.json();


        // ==================================
        // SERVER ERROR
        // ==================================

        if (!data.success) {

            message.textContent =
                data.message ||
                "Unable to change password.";

            message.classList.add("error");

            return;
        }


        // ==================================
        // SUCCESS
        // ==================================

        message.textContent =
            "Password changed successfully.";

        message.classList.add("success");


        // Clear fields

        document.getElementById(
            "current-password"
        ).value = "";

        document.getElementById(
            "new-password"
        ).value = "";

        document.getElementById(
            "confirm-password"
        ).value = "";


    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";

        message.classList.add("error");

    }

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.clear();

    window.location.href =
        "index.html";

}


// ==========================================
// START
// ==========================================

loadUser();