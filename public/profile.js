// ==========================
// Load Logged-in User
// ==========================

const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "/";
}

// ==========================
// Load Profile
// ==========================

async function loadProfile() {

    try {

        const response = await fetch("/api/user/" + userId);
        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        const user = data.user;
        document.getElementById("security-email").innerText =
    user.email || "Not available";

document.getElementById("security-account").innerText =
    user.accountNumber || "Not available";

        document.getElementById("fullName").value =
            user.fullName || "";

        document.getElementById("email").value =
            user.email || "";

            if (user.profileImage) {

    document.getElementById("profile-image").src =
        user.profileImage;

}

    } catch (error) {

        console.log(error);
        alert("Unable to load profile.");

    }

}

loadProfile();
// ==========================
// Profile Picture
// ==========================

const imageInput =
    document.getElementById("image-input");

const profileImageElement =
    document.getElementById("profile-image");

let selectedProfileImage = "";

if (imageInput && profileImageElement) {

    imageInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        // Check file type
        if (!file.type.startsWith("image/")) {

            alert("Please select an image file.");
            this.value = "";
            return;

        }

        // Limit image size to 5 MB
        if (file.size > 5 * 1024 * 1024) {

            alert("Image must be smaller than 5 MB.");
            this.value = "";
            return;

        }

        const reader = new FileReader();

        reader.onload = function (event) {

            selectedProfileImage =
                event.target.result;

            // Show preview
            profileImageElement.src =
                selectedProfileImage;

        };

        reader.readAsDataURL(file);

    });

}
async function saveProfile() {

    const fullName =
        document.getElementById("fullName").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const currentPassword =
        document.getElementById("current-password").value;

    const newPassword =
        document.getElementById("new-password").value;

    const confirmPassword =
        document.getElementById("confirm-password").value;

    const profileImage =
        document.getElementById("profile-image").src;


    // ==========================
    // Basic Profile Validation
    // ==========================

    if (!fullName || !email) {

        alert("Full name and email are required.");
        return;

    }


    // ==========================
    // Password Validation
    // ==========================

    if (newPassword || confirmPassword || currentPassword) {

        if (!currentPassword) {
            alert("Enter your current password.");
            return;
        }

        if (!newPassword) {
            alert("Enter a new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters.");
            return;
        }

    }


    try {

        // ==========================
        // Update Profile
        // ==========================

        const profileResponse =
            await fetch("/api/profile", {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    userId,
                    fullName,
                    email,
                    profileImage

                })

            });


        const profileData =
            await profileResponse.json();


        if (!profileData.success) {

            alert(profileData.message);
            return;

        }


        // ==========================
        // Change Password
        // ==========================

        if (currentPassword &&
            newPassword &&
            confirmPassword) {

            const passwordResponse =
                await fetch("/api/change-password", {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        userId,
                        currentPassword,
                        newPassword

                    })

                });


            const passwordData =
                await passwordResponse.json();


            if (!passwordData.success) {

                alert(passwordData.message);
                return;

            }

        }


        // ==========================
        // Update Local Storage
        // ==========================

        localStorage.setItem(
            "fullName",
            profileData.user.fullName
        );


        // Clear password fields

        document.getElementById(
            "current-password"
        ).value = "";

        document.getElementById(
            "new-password"
        ).value = "";

        document.getElementById(
            "confirm-password"
        ).value = "";


        alert("Profile updated successfully!");


    } catch (error) {

        console.log("PROFILE UPDATE ERROR:", error);

        alert("Unable to update profile.");

    }

}