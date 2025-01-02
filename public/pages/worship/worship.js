document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const menuBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("close-btn");
    const drawer = document.getElementById("drawer");

    menuBtn.addEventListener("click", () => {
        drawer.classList.add("open");
    });

    closeBtn.addEventListener("click", () => {
        drawer.classList.remove("open");
    });
});