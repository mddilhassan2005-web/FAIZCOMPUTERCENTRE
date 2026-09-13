// ============================================================
// FAIZ COMPUTER CENTRE
// RESULT CHECKER
// DIRECT FIRESTORE GET
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc
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
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ============================================================
// ELEMENTS
// ============================================================

const rollInput =
    document.getElementById("roll-number");

const testIdInput =
    document.getElementById("test-id");

const rollBtn =
    document.getElementById("roll-btn");

const resultsContainer =
    document.querySelector(".results-container");

const studentName =
    document.getElementById("s-n");

const studentRoll =
    document.getElementById("s-r-n");

const studentMarks =
    document.getElementById("s-m");


// ============================================================
// FORMAT FCC PREFIX WHILE TYPING
// ============================================================

function addFCCPrefix(input) {

    if (!input) return;

    let value = input.value;

    // Remove spaces
    value = value.replace(/\s+/g, "");

    // Remove existing FCC- prefix
    value = value.replace(/^FCC-/i, "");

    // Don't show FCC- when input is completely empty
    if (value.length === 0) {

        input.value = "";

        return;
    }

    // Add FCC-
    input.value = "FCC-" + value;
}


// ============================================================
// ROLL NUMBER INPUT
// ============================================================

if (rollInput) {

    rollInput.addEventListener(
        "input",
        () => {

            addFCCPrefix(rollInput);

            // Hide old result when user starts
            // entering another roll number

            hideResult();

        }
    );

}


// ============================================================
// TEST ID INPUT
// ============================================================

if (testIdInput) {

    testIdInput.addEventListener(
        "input",
        () => {


            // Hide old result when user changes test ID

            hideResult();

        }
    );

}


// ============================================================
// HIDE RESULT
// ============================================================

function hideResult() {

    if (!resultsContainer) return;

    resultsContainer.classList.add(
        "hidden"
    );

    resultsContainer.classList.remove(
        "loading-state"
    );


    if (studentName) {

        studentName.classList.add(
            "loading"
        );

        studentName.textContent = "";

    }


    if (studentRoll) {

        studentRoll.classList.add(
            "loading"
        );

        studentRoll.textContent = "";

    }


    if (studentMarks) {

        studentMarks.classList.add(
            "loading"
        );

        studentMarks.textContent = "";

    }

}


// ============================================================
// SHOW LOADING
// ============================================================

function showLoading() {

    if (!resultsContainer) return;


    resultsContainer.classList.remove(
        "hidden"
    );


    resultsContainer.classList.add(
        "loading-state"
    );


    if (studentName) {

        studentName.classList.add(
            "loading"
        );

        studentName.textContent =
            "Checking...";

    }


    if (studentRoll) {

        studentRoll.classList.add(
            "loading"
        );

        studentRoll.textContent =
            "Please wait";

    }


    if (studentMarks) {

        studentMarks.classList.add(
            "loading"
        );

        studentMarks.textContent =
            "...";

    }

}


// ============================================================
// DISPLAY RESULT
// ============================================================

function displayResult(data) {

    if (!resultsContainer) return;


    // Remove container loading
    resultsContainer.classList.remove(
        "loading-state"
    );


    // Remove text loading
    studentName?.classList.remove(
        "loading"
    );

    studentRoll?.classList.remove(
        "loading"
    );

    studentMarks?.classList.remove(
        "loading"
    );


    // Student name
    if (studentName) {

        studentName.textContent =
            data.studentName || "N/A";

    }


    // Roll number
    if (studentRoll) {

        studentRoll.textContent =
            data.rollNumber || "N/A";

    }


    // Marks
    if (studentMarks) {

        studentMarks.textContent =
            `${data.gainMarks ?? 0}/${data.fullMarks ?? 0}`;

    }

}


// ============================================================
// DYNAMIC RESULT DIALOG
// ============================================================

function showDialog(title, message) {

    // Remove previous dialog

    document
        .getElementById("fcc-result-dialog")
        ?.remove();


    const dialog =
        document.createElement("div");

    dialog.id =
        "fcc-result-dialog";


    dialog.innerHTML = `

        <div class="fcc-result-dialog-backdrop">

            <div class="fcc-result-dialog-box">

                <div class="fcc-result-dialog-icon">
                    !
                </div>

                <h2>
                    ${escapeHTML(title)}
                </h2>

                <p>
                    ${escapeHTML(message)}
                </p>

                <button
                    type="button"
                    class="fcc-result-dialog-btn"
                >
                    Try Again
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        dialog
    );


    dialog
        .querySelector(
            ".fcc-result-dialog-btn"
        )
        .addEventListener(
            "click",
            () => {

                dialog.remove();

                rollInput?.focus();

            }
        );

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
// CHECK RESULT
// ============================================================

async function checkResult() {

    const roll =
        rollInput?.value.trim() || "";

    const testId =
        testIdInput?.value.trim() || "";


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!roll) {

        hideResult();

        showDialog(
            "Roll Number Required",
            "Please enter your roll number."
        );

        rollInput?.focus();

        return;
    }


    if (!testId) {

        hideResult();

        showDialog(
            "Test ID Required",
            "Please enter the Test ID."
        );

        testIdInput?.focus();

        return;
    }


    // ========================================================
    // ENSURE FCC PREFIX
    // ========================================================

    addFCCPrefix(rollInput);

    addFCCPrefix(testIdInput);


    const finalRoll =
        rollInput.value.trim();

    const finalTestId =
        testIdInput.value.trim();


    // ========================================================
    // HIDE PREVIOUS RESULT
    // ========================================================

    hideResult();


    // ========================================================
    // SHOW LOADING
    // ========================================================

    showLoading();


    // Disable button

    if (rollBtn) {

        rollBtn.dataset.oldText =
            rollBtn.textContent;

        rollBtn.textContent =
            "Checking...";

        rollBtn.style.pointerEvents =
            "none";

        rollBtn.style.opacity =
            "0.7";

    }


    try {

        // ====================================================
        // DIRECT DOCUMENT PATH
        //
        // FCC
        //   └── FCC-10092026
        //        └── results
        //             └── FCC-2026-52
        //
        // ====================================================

        const resultRef =
            doc(
                db,
                "FCC",
                finalTestId,
                "results",
                finalRoll
            );


        // ====================================================
        // DIRECT GET
        // ====================================================

        const resultSnap =
            await getDoc(
                resultRef
            );


        // ====================================================
        // RESULT NOT FOUND
        // ====================================================

        if (!resultSnap.exists()) {

            hideResult();

            showDialog(
                "Result Not Found",
                `No result was found for ${finalRoll} in ${finalTestId}. Please check your Roll Number and Test ID.`
            );

            return;
        }


        // ====================================================
        // GET DATA
        // ====================================================

        const resultDocument =
            resultSnap.data();


        const data =
            resultDocument.data ||
            resultDocument;


        // ====================================================
        // DISPLAY RESULT
        // ====================================================

        displayResult(
            data
        );


    } catch (error) {

        console.error(
            "Result check error:",
            error
        );


        hideResult();


        if (
            error.code ===
            "permission-denied"
        ) {

            showDialog(
                "Access Denied",
                "Unable to access the result. Please check your Firebase Firestore rules."
            );

        } else {

            showDialog(
                "Something Went Wrong",
                "Unable to check the result right now. Please try again."
            );

        }


    } finally {

        // Enable button

        if (rollBtn) {

            rollBtn.textContent =
                rollBtn.dataset.oldText ||
                "Check Result";

            rollBtn.style.pointerEvents =
                "";

            rollBtn.style.opacity =
                "";

        }

    }

}


// ============================================================
// BUTTON
// ============================================================

if (rollBtn) {

    rollBtn.addEventListener(
        "click",
        checkResult
    );

}


// ============================================================
// ENTER KEY
// ============================================================

[
    rollInput,
    testIdInput
].forEach(input => {

    if (!input) return;


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                checkResult();

            }

        }
    );

});


// ============================================================
// INITIAL STATE
// ============================================================

hideResult();