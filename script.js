
const adca = document.querySelector('.adca');
const dca = document.querySelector('.dca');
const dtp = document.querySelector('.dtp');

adca?.addEventListener("click", () =>open_course(0));
dca?.addEventListener("click", () =>open_course(1));
dtp?.addEventListener("click", () =>open_course(2));

function open_course(course_index) {

    if (course_index === 0) {
        open_adca_course();
    }
    else if (course_index === 1) {
        open_dca_course();
    }
    else if (course_index === 2) {
        open_dtp_course();
    }
}

function open_adca_course(){
    const coursec = querySelector('.course-sec');
    coursec?.classList.toggle('active');
}
function open_dca_course(){
    const coursec = querySelector('.course-sec');
    coursec?.classList.toggle('active');
}
function open_dtp_course(){
    const coursec = querySelector('.course-sec');
    coursec?.classList.toggle('active');
}



