
/* =========================================================
   SESSION SWITCHING
========================================================= */

const sessionTabs =
    document.querySelectorAll(".session-tab");

const sessionContents =
    document.querySelectorAll(".session-content");


sessionTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        const session =
            tab.dataset.session;


        /* Remove active tabs */

        sessionTabs.forEach(item => {

            item.classList.remove("active");

        });


        /* Hide sessions */

        sessionContents.forEach(section => {

            section.classList.remove("active");

        });


        /* Activate clicked */

        tab.classList.add("active");


        const target =
            document.getElementById(
                "session-" + session
            );


        target.classList.add("active");


        /* Reset search */

        const search =
            target.querySelector(
                ".module-search"
            );

        if(search){

            search.value = "";

        }


        /* Show all modules */

        target
            .querySelectorAll(".module-card")
            .forEach(card => {

                card.style.display = "";

            });


        updateNoResults(target);


        /* Animate progress */

        animateProgress(target);


        /* Reveal cards */

        revealCards(target);


        /* Smooth scroll */

        setTimeout(() => {

            target.scrollIntoView({

                behavior:"smooth",

                block:"start"

            });

        },80);

    });

});


/* =========================================================
   PROGRESS BAR
========================================================= */

function animateProgress(container){

    const bars =
        container.querySelectorAll(
            ".progress-bar"
        );


    bars.forEach(bar => {

        const width =
            bar.dataset.width;


        bar.style.width = "0";


        setTimeout(() => {

            bar.style.width = width;

        },120);

    });

}


/* =========================================================
   SEARCH MODULES
========================================================= */

document
    .querySelectorAll(".module-search")
    .forEach(search => {


    search.addEventListener("input", () => {

        const query =
            search.value
                .toLowerCase()
                .trim();


        const session =
            search.closest(
                ".session-content"
            );


        const modules =
            session.querySelectorAll(
                ".module-card"
            );


        modules.forEach(module => {

            const text =
                module.innerText
                    .toLowerCase();


            if(
                text.includes(query)
                || query === ""
            ){

                module.style.display = "";

            }else{

                module.style.display = "none";

            }

        });


        updateNoResults(session);

    });

});


/* =========================================================
   NO SEARCH RESULT
========================================================= */

function updateNoResults(session){

    const modules =
        session.querySelectorAll(
            ".module-card"
        );


    const noResults =
        session.querySelector(
            ".no-results"
        );


    let visible = 0;


    modules.forEach(module => {

        if(
            module.style.display !== "none"
        ){

            visible++;

        }

    });


    if(visible === 0){

        noResults.style.display = "block";

    }else{

        noResults.style.display = "none";

    }

}


/* =========================================================
   CARD REVEAL
========================================================= */

function revealCards(container){

    const cards =
        container.querySelectorAll(
            ".module-card"
        );


    cards.forEach((card,index) => {

        card.classList.remove("show");


        setTimeout(() => {

            card.classList.add("show");

        },index * 70);

    });

}


/* =========================================================
   INTERSECTION OBSERVER
========================================================= */

const observer =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if(
                    entry.isIntersecting
                ){

                    entry.target
                        .classList
                        .add("show");

                }

            });

        },

        {
            threshold:.12
        }

    );


document
    .querySelectorAll(".reveal")
    .forEach(element => {

        observer.observe(element);

    });


/* =========================================================
   INITIAL LOAD
========================================================= */

window.addEventListener("load", () => {

    const firstSession =
        document.getElementById(
            "session-1"
        );


    animateProgress(firstSession);

    revealCards(firstSession);

});


/* =========================================================
   KEYBOARD SHORTCUT
   1 / 2 / 3 / 4 = SESSION
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if(
            event.target.tagName === "INPUT"
        ){

            return;

        }


        const key =
            event.key;


        if(
            ["1","2","3","4"]
            .includes(key)
        ){

            const tab =
                document.querySelector(
                    `.session-tab[data-session="${key}"]`
                );


            if(tab){

                tab.click();

            }

        }

    }
);


/* =========================================================
   SESSION TAB ACCESSIBILITY
========================================================= */

sessionTabs.forEach(tab => {

    tab.setAttribute(
        "role",
        "button"
    );

    tab.setAttribute(
        "tabindex",
        "0"
    );


    tab.addEventListener(
        "keydown",
        event => {

            if(
                event.key === "Enter"
                ||
                event.key === " "
            ){

                event.preventDefault();

                tab.click();

            }

        }
    );

});