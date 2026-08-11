async function register() {

    const fullName = document.getElementById("fullname").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            fullName,
            username,
            email,
            password
        })

    });

    const data = await response.json();

    if (data.success) {

        alert("Account created successfully!");

        window.location.href = "/";

    } else {

        alert(data.message);

    }

}