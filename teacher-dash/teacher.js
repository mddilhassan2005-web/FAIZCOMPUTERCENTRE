// ============================================================
// FAIZ COMPUTER CENTRE — TEACHER.JS
// Teacher Login + Result Update
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyASYhyATCPXcWivYoGlko8XKdrcUjSre_E",
    authDomain: "faiz-cmputer-center.firebaseapp.com",
    projectId: "faiz-cmputer-center",
    storageBucket: "faiz-cmputer-center.firebasestorage.app",
    messagingSenderId: "870718650623",
    appId: "1:870718650623:web:9c05b7711014549a9bb4ca",
    measurementId: "G-BL9LFV14ZD"
};


// ============================================================
// FIREBASE INITIALIZE
// ============================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ============================================================
// BASIC ELEMENTS
// ============================================================

const loginBtn = document.getElementById("login-btn");
const rollBtn = document.getElementById("roll-btn");

const loginOverlay = document.querySelector(".login-overlay");

const teacherEmail = document.getElementById("teacher-email");
const teacherPassword = document.getElementById("teacher-password");
const teacherSecKey = document.getElementById("teacher-sec-key");

const rollNumber = document.getElementById("roll-number");
const testDate = document.getElementById("test-date");
const studentName = document.getElementById("student-name");
const fullMarks = document.getElementById("full-marks");
const gainMarks = document.getElementById("gain-marks");


// ============================================================
// DYNAMIC DIALOG SYSTEM
// ============================================================

function showDialog(
    title,
    message,
    type = "info",
    buttonText = "OK",
    callback = null
) {

    // Remove old dialog
    const oldDialog = document.getElementById("fcc-dialog");

    if (oldDialog) {
        oldDialog.remove();
    }

    const dialog = document.createElement("div");

    dialog.id = "fcc-dialog";

    dialog.innerHTML = `
        <div class="fcc-dialog-backdrop">
            <div class="fcc-dialog-box">

                <div class="fcc-dialog-icon">
                    ${
                        type === "success"
                            ? "✓"
                            : type === "error"
                            ? "✕"
                            : type === "warning"
                            ? "!"
                            : "i"
                    }
                </div>

                <h2>${escapeHTML(title)}</h2>

                <p>${escapeHTML(message)}</p>

                <button id="fcc-dialog-btn">
                    ${escapeHTML(buttonText)}
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const button = document.getElementById("fcc-dialog-btn");

    button.addEventListener("click", () => {

        dialog.remove();

        if (typeof callback === "function") {
            callback();
        }

    });
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// SHA-256
// ============================================================

async function sha256(text) {

    const encoder = new TextEncoder();

    const data = encoder.encode(text);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    const hashArray = Array.from(
        new Uint8Array(hashBuffer)
    );

    return hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


// ============================================================
// REDIRECT TO STUDENT
// ============================================================

function redirectToStudent() {

    window.location.href = "index.html";

}


// ============================================================
// TEACHER LOGIN
// ============================================================

async function loginTeacher() {

    const email =
        teacherEmail?.value.trim() || "";

    const password =
        teacherPassword?.value || "";

    const secKey =
        teacherSecKey?.value.trim() || "";


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!email) {

        showDialog(
            "Email Required",
            "Please enter your teacher email.",
            "warning"
        );

        teacherEmail?.focus();

        return;
    }


    if (!password) {

        showDialog(
            "Password Required",
            "Please enter your password.",
            "warning"
        );

        teacherPassword?.focus();

        return;
    }


    if (!secKey) {

        showDialog(
            "Sec-Key Required",
            "Please enter your teacher Sec-Key.",
            "warning"
        );

        teacherSecKey?.focus();

        return;
    }


    // --------------------------------------------------------
    // DISABLE LOGIN BUTTON
    // --------------------------------------------------------

    if (loginBtn) {

        loginBtn.disabled = true;

        loginBtn.dataset.oldText =
            loginBtn.textContent;

        loginBtn.textContent =
            "Verifying...";

    }


    try {

        // ----------------------------------------------------
        // FIREBASE AUTH LOGIN
        // ----------------------------------------------------

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user =
            credential.user;


        // ----------------------------------------------------
        // GET TEACHER DOCUMENT
        // ----------------------------------------------------

        const teacherRef =
            doc(
                db,
                "FCC",
                "teachers",
                "all",
                user.uid
            );

        const teacherSnap =
            await getDoc(teacherRef);


        // ----------------------------------------------------
        // TEACHER DOCUMENT NOT FOUND
        // ----------------------------------------------------

        if (!teacherSnap.exists()) {

            await signOut(auth);

            showDialog(
                "Access Denied",
                "This account is not registered as a teacher.",
                "error"
            );

            return;
        }


        const teacher =
            teacherSnap.data();


        // ----------------------------------------------------
        // CHECK ROLE
        // ----------------------------------------------------

        if (teacher.role !== "teacher") {

            await signOut(auth);

            showDialog(
                "Access Denied",
                "Your account does not have teacher permission.",
                "error",
                "OK",
                redirectToStudent
            );

            return;
        }


        // ----------------------------------------------------
        // CHECK UID
        // ----------------------------------------------------

        if (
            teacher.uid &&
            teacher.uid !== user.uid
        ) {

            await signOut(auth);

            showDialog(
                "Verification Failed",
                "Teacher account verification failed.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // CHECK EMAIL
        // ----------------------------------------------------

        if (
            teacher.email &&
            teacher.email.toLowerCase() !==
            user.email.toLowerCase()
        ) {

            await signOut(auth);

            showDialog(
                "Verification Failed",
                "Teacher email verification failed.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // CHECK SEC-KEY HASH
        // ----------------------------------------------------

        if (!teacher.secKeyHash) {

            await signOut(auth);

            showDialog(
                "Verification Failed",
                "Teacher Sec-Key is not configured.",
                "error"
            );

            return;
        }


        const enteredSecKeyHash =
            await sha256(secKey);


        if (
            enteredSecKeyHash !==
            teacher.secKeyHash
        ) {

            await signOut(auth);

            showDialog(
                "Wrong Sec-Key",
                "The Sec-Key you entered is incorrect.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        if (loginOverlay) {

            loginOverlay.style.display =
                "none";

        }


        showDialog(
            "Login Successful",
            "Teacher verification completed successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Teacher login error:",
            error
        );


        let message =
            "Unable to login. Please try again.";


        switch (error.code) {

            case "auth/invalid-credential":

                message =
                    "Email or password is incorrect.";

                break;


            case "auth/user-not-found":

                message =
                    "No account exists with this email.";

                break;


            case "auth/wrong-password":

                message =
                    "The password is incorrect.";

                break;


            case "auth/invalid-email":

                message =
                    "Please enter a valid email address.";

                break;


            case "auth/too-many-requests":

                message =
                    "Too many login attempts. Please try again later.";

                break;


            case "auth/network-request-failed":

                message =
                    "Network error. Please check your internet connection.";

                break;


            case "auth/user-disabled":

                message =
                    "This teacher account has been disabled.";

                break;

        }


        showDialog(
            "Login Failed",
            message,
            "error"
        );


    } finally {

        if (loginBtn) {

            loginBtn.disabled = false;

            loginBtn.textContent =
                loginBtn.dataset.oldText ||
                "Login";

        }

    }

}


// ============================================================
// AUTH STATE CHECK
// ============================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        if (loginOverlay) {

            loginOverlay.style.display =
                "flex";

        }

        return;
    }


    try {

        const teacherRef =
            doc(
                db,
                "FCC",
                "teachers",
                "all",
                user.uid
            );


        const teacherSnap =
            await getDoc(teacherRef);


        // ----------------------------------------------------
        // NO TEACHER RECORD
        // ----------------------------------------------------

        if (!teacherSnap.exists()) {

            await signOut(auth);

            if (loginOverlay) {

                loginOverlay.style.display =
                    "flex";

            }

            return;
        }


        const teacher =
            teacherSnap.data();


        // ----------------------------------------------------
        // ROLE CHECK
        // ----------------------------------------------------

        if (teacher.role !== "teacher") {

            await signOut(auth);

            redirectToStudent();

            return;
        }


        // ----------------------------------------------------
        // TEACHER VERIFIED
        // ----------------------------------------------------

        if (loginOverlay) {

            loginOverlay.style.display =
                "none";

        }


    } catch (error) {

        console.error(
            "Auth state verification error:",
            error
        );

        await signOut(auth);

    }

});


// ============================================================
// UPDATE RESULT
// ============================================================

async function updateResult() {

    const roll =
        rollNumber?.value.trim() || "";

    const date =
        testDate?.value.trim() || "";

    const name =
        studentName?.value.trim() || "";

    const full =
        Number(fullMarks?.value);

    const gain =
        Number(gainMarks?.value);


    // --------------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------------

    const user =
        auth.currentUser;


    if (!user) {

        showDialog(
            "Login Required",
            "Please login as a teacher first.",
            "warning"
        );

        if (loginOverlay) {

            loginOverlay.style.display =
                "flex";

        }

        return;
    }


    // --------------------------------------------------------
    // CHECK TEACHER
    // --------------------------------------------------------

    try {

        const teacherRef =
            doc(
                db,
                "FCC",
                "teachers",
                "all",
                user.uid
            );


        const teacherSnap =
            await getDoc(teacherRef);


        if (!teacherSnap.exists()) {

            await signOut(auth);

            showDialog(
                "Access Denied",
                "Teacher verification failed.",
                "error"
            );

            return;
        }


        const teacher =
            teacherSnap.data();


        if (teacher.role !== "teacher") {

            await signOut(auth);

            redirectToStudent();

            return;
        }


        // ----------------------------------------------------
        // INPUT VALIDATION
        // ----------------------------------------------------

        if (!roll) {

            showDialog(
                "Roll Number Required",
                "Please enter the student's roll number.",
                "warning"
            );

            rollNumber?.focus();

            return;
        }


        if (!date) {

            showDialog(
                "Test Date Required",
                "Please enter the test date.",
                "warning"
            );

            testDate?.focus();

            return;
        }


        if (!name) {

            showDialog(
                "Student Name Required",
                "Please enter the student's name.",
                "warning"
            );

            studentName?.focus();

            return;
        }


        if (
            !Number.isFinite(full) ||
            full <= 0
        ) {

            showDialog(
                "Invalid Full Marks",
                "Full marks must be greater than zero.",
                "warning"
            );

            fullMarks?.focus();

            return;
        }


        if (
            !Number.isFinite(gain) ||
            gain < 0 ||
            gain > full
        ) {

            showDialog(
                "Invalid Gain Marks",
                "Gain marks must be between 0 and full marks.",
                "warning"
            );

            gainMarks?.focus();

            return;
        }


        // ----------------------------------------------------
        // PERCENTAGE
        // ----------------------------------------------------

        const percentage =
            Number(
                ((gain / full) * 100)
                    .toFixed(2)
            );


        // ----------------------------------------------------
        // FIRESTORE DATA
        // ----------------------------------------------------

        const resultData = {

            rollNumber: roll,

            testDate: date,

            studentName: name,

            fullMarks: full,

            gainMarks: gain,

            percentage: percentage,

            updatedBy: user.uid,

            teacherEmail:
                user.email || "",

            updatedAt:
                serverTimestamp()

        };


        // ----------------------------------------------------
        // FIRESTORE PATH
        // FCC/{testDate}/results/{rollNumber}
        // ----------------------------------------------------

        const resultRef =
            doc(
                db,
                "FCC",
                date,
                "results",
                roll
            );


        // ----------------------------------------------------
        // SAVE RESULT
        // ----------------------------------------------------

        if (rollBtn) {

            rollBtn.disabled = true;

            rollBtn.dataset.oldText =
                rollBtn.textContent;

            rollBtn.textContent =
                "Updating...";

        }


        await setDoc(
            resultRef,
            {
                data: resultData
            }
        );


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        showDialog(
            "Result Updated",
            `Result for ${name} (${roll}) has been updated successfully.`,
            "success"
        );


        // ----------------------------------------------------
        // OPTIONAL CLEAR
        // ----------------------------------------------------

        if (studentName) {
            studentName.value = "";
        }

        if (fullMarks) {
            fullMarks.value = "";
        }

        if (gainMarks) {
            gainMarks.value = "";
        }


    } catch (error) {

        console.error(
            "Result update error:",
            error
        );


        let message =
            "Unable to update the result.";


        if (
            error.code ===
            "permission-denied"
        ) {

            message =
                "Firestore permission denied. Check your Firebase security rules.";

        } else if (
            error.code ===
            "unavailable"
        ) {

            message =
                "Firebase is temporarily unavailable. Please try again.";

        }


        showDialog(
            "Update Failed",
            message,
            "error"
        );


    } finally {

        if (rollBtn) {

            rollBtn.disabled = false;

            rollBtn.textContent =
                rollBtn.dataset.oldText ||
                "Update Result";

        }

    }

}


// ============================================================
// LOGIN BUTTON
// ============================================================

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        loginTeacher
    );

}


// ============================================================
// RESULT BUTTON
// ============================================================

if (rollBtn) {

    rollBtn.addEventListener(
        "click",
        updateResult
    );

}


// ============================================================
// ENTER KEY LOGIN
// ============================================================

[
    teacherEmail,
    teacherPassword,
    teacherSecKey
].forEach(input => {

    if (!input) return;


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                loginTeacher();

            }

        }
    );

});


// ============================================================
// ENTER KEY RESULT UPDATE
// ============================================================

[
    rollNumber,
    testDate,
    studentName,
    fullMarks,
    gainMarks
].forEach(input => {

    if (!input) return;


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                updateResult();

            }

        }
    );

});