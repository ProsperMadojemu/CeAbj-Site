document.addEventListener('DOMContentLoaded', () => {


    const initializeUserSession = async () => {
        try {
            const localUserSession = localStorage.getItem('userSession');

            if (localUserSession) {
                const userSession = JSON.parse(localUserSession);
                if (userSession.email) {
                    updateUI(userSession);
                    return;
                }
            }

            const response = await fetch('/check-session', { credentials: 'include' });
            if (!response.ok) {
                throw new Error('Session check failed');
            }

            const sessionData = await response.json();
            if (sessionData.email) {
                localStorage.setItem('userSession', JSON.stringify(sessionData));
                updateUI(sessionData);
            } else {
                throw new Error('Session invalid');
            }
        } catch (error) {
            console.error('Failed to fetch or validate session:', error);
            localStorage.removeItem('userSession');
        }
    };

    const updateUI = (user) => {
        const { firstName, lastName, isAdmin } = user;
        const userGreeting = document.querySelector('.userGreeting');
        const loginButton = document.getElementById('Login-Button');
        const userIcon = document.getElementById('loginIcon');

        if (!isAdmin) {
            userGreeting.textContent = `Hi, ${firstName} ${lastName}`;
            loginButton.classList.add('hidden-class');
            userIcon.classList.replace('login_icon', 'login_icon-visible');
            const userDropMenu = document.getElementById('user-dropdown');
            const cancelDropdown = document.getElementById('cancel-click');
            loginIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown(userDropMenu, 'show');
            });

            document.addEventListener('click', (e) => {
                if (!userDropMenu.contains(e.target) && !loginIcon.contains(e.target)) {
                    toggleDropdown(userDropMenu, 'hide');
                }
            });
            const toggleDropdown = (menu, action) => {
                if (menu) {
                    menu.classList.toggle('login-content-before-click', action === 'hide');
                    menu.classList.toggle('login-content-after-click', action === 'show');
                } else {
                    console.warn('Menu element not found');
                }
            };
            cancelDropdown.addEventListener('click', () => toggleDropdown(userDropMenu, 'hide'));
        }
        const logoutUser = async () => {
            try {
                await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
                localStorage.removeItem('userSession');
                window.location.reload();
            } catch (error) {
                console.error('Logout failed:', error);
            }
        };
        document.getElementById('Logout-Button').addEventListener('click', logoutUser)
    };


    initializeUserSession();



    const navbar = document.querySelector('.landing-page-navbar');
    const loginButton = document.querySelector('.btn-71');
    const loggedInButton = document.querySelector('#loginIcon')

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('navbar-bg-change');
            loginButton.classList.add('btn-71-bg-change');
            loggedInButton.classList.add('login_icon-change');
        } else {
            navbar.classList.remove('navbar-bg-change');
            loginButton.classList.remove('btn-71-bg-change');
            loggedInButton.classList.remove('login_icon-change');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const imageBlocks = document.querySelectorAll('.image-block');
    let currentIndex = 0; // To keep track of the current image block index

    imageBlocks.forEach(imageBlock => {
        imageBlock.addEventListener('click', expandImage);
    });

    function expandImage(event) {
        imageBlocks.forEach(block => block.classList.remove('expanded', 'no-hover'));

        if (event) {
            event.currentTarget.classList.add('expanded', 'no-hover');
        } else {
            imageBlocks[currentIndex].classList.add('expanded', 'no-hover');
        }
    }

    function cycleImages() {
        expandImage();
        currentIndex = (currentIndex + 1) % imageBlocks.length;
    }

    setInterval(cycleImages, 5000);

    const carouselRow = document.querySelector('.slides-row');
    const carouselSlides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');

    let index = 0;

    function updateCarousel() {
        carouselRow.style.transform = 'translateX(' + (-index * 100) + '%)';
        updateDots();
    }

    function updateDots() {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    nextBtn.addEventListener('click', () => {
        index = (index + 1) % carouselSlides.length; // Loop back to the first slide
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        index = (index - 1 + carouselSlides.length) % carouselSlides.length; // Loop back to the last slide
        updateCarousel();
    });

    // Optional: Auto slide functionality
    setInterval(() => {
        index = (index + 1) % carouselSlides.length;
        updateCarousel();
    }, 5000); // Change slide every 5 seconds

    document.getElementById('Login-Button').addEventListener('click', function () {
        window.location.href = '/login';
    });

    const fadeSlides = document.querySelectorAll('.fade-slide');
    const fadeIndicators = document.querySelectorAll('.fade-indicator');
    const fadePauseButton = document.getElementById('fade-pause');
    let fadeCurrentIndex = 0;
    let fadeInterval;

    function showFadeSlide(index) {
        fadeSlides.forEach((slide, i) => {
            slide.classList.remove('active', 'pull-left', 'pull-top');
            fadeIndicators[i].classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
                const randomEffect = Math.random() > 0.5 ? 'pull-left' : 'pull-top';
                slide.classList.add(randomEffect);
                fadeIndicators[i].classList.add('active');
            }
        });
    }

    function nextFadeSlide() {
        fadeCurrentIndex = (fadeCurrentIndex + 1) % fadeSlides.length;
        showFadeSlide(fadeCurrentIndex);
    }

    function startFadeSlideshow() {
        fadeInterval = setInterval(nextFadeSlide, 10000); // 7 seconds
    }

    function pauseFadeSlideshow() {
        clearInterval(fadeInterval);
    }

    fadePauseButton.addEventListener('click', pauseFadeSlideshow);

    fadeIndicators.forEach((indicator, i) => {
        indicator.addEventListener('click', () => {
            fadeCurrentIndex = i;
            showFadeSlide(fadeCurrentIndex);
        });
    });

    // Start the slideshow
    startFadeSlideshow();
    const video = document.getElementById('scroll-video');
    const videoContainer = document.getElementById('video-container');

    video.addEventListener('loadedmetadata', () => {
        video.playbackRate = 0.5;
    });
    
    if (video && videoContainer) {
        gsap.registerPlugin(ScrollTrigger);

        video.addEventListener('loadedmetadata', () => {
            ScrollTrigger.create({
                trigger: videoContainer,
                start: "top top", 
                end: "bottom top",
                onEnter: () => {
                    video.play();
                },
                onLeave: () => {
                    video.pause();
                },
                onEnterBack: () => {
                    video.play(); 
                },
                onLeaveBack: () => {
                    video.pause(); 
                },
            });
        });
    } else {
        console.error("Element(s) not found: #scroll-video or #video-container");
    }
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


    // if (video && videoContainer) {
    //     gsap.registerPlugin(ScrollTrigger);

    //     video.addEventListener('loadedmetadata', () => {
    //         const videoDuration = video.duration;

    //         ScrollTrigger.create({
    //             trigger: videoContainer,
    //             start: "top top", 
    //             end: "bottom top",
    //             scrub: true,
    //             onUpdate: (self) => {
    //                 const playback = self.progress * videoDuration;
    //                 requestAnimationFrame(() => {
    //                     video.currentTime = playback;
    //                 });
    //             },
    //         });
    //     });
    // } else {
    //     console.error("Element(s) not found: #scroll-video or #video-container");
    // }

    
});