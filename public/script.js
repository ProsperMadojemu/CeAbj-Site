document.addEventListener('DOMContentLoaded', () => {
    fetch('/check-session')
    .then(response => response.json())
    .then(sessionData => {
        if (sessionData.email && !sessionData.isAdmin) {
            const welcomeGreeting = document.querySelector('.userGreeting');
            const cancelDropdown = document.getElementById('cancel-click');
            const userIcon = document.querySelector('#loginIcon');
            const userDropMenu = document.querySelector('#user-dropdown');
        
            userIcon.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent the click event from bubbling up to the document
                console.log('click seen');
                userDropMenu.classList.remove('login-content-before-click');
                userDropMenu.classList.add('login-content-after-click');
            });
            
            document.addEventListener('click', function(event) {
                if (!userDropMenu.contains(event.target) && !userIcon.contains(event.target)) {
                    userDropMenu.classList.remove('login-content-after-click');
                    userDropMenu.classList.add('login-content-before-click');
                }
            });
            
            cancelDropdown.addEventListener('click',function() {
                userDropMenu.classList.remove('login-content-after-click');
                userDropMenu.classList.add('login-content-before-click');
            })
            // Optionally add a logout button
            welcomeGreeting.innerHTML = `Hi, ${sessionData.firstName} ${sessionData.lastName}`;
            const logoutButton = document.getElementById('Logout-Button');
            const loginIcon = document.getElementById('loginIcon');
            loginButton.classList.remove('btn-71');
            loginButton.classList.add('hidden-class');
            loginIcon.classList.remove('login_icon');
            loginIcon.classList.add('login_icon-visible');
            logoutButton.addEventListener('click', () => {
                fetch('/logout', { method: 'POST' })
                .then(() => {
                    window.location.reload();
                });
            });
        }
    });
    
    const navbar = document.querySelector('.landing-page-navbar');
    const loginButton = document.querySelector('.btn-71');
    const loggedInButton = document.querySelector('.login_icon')

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

    const text1 = document.getElementById('text1');
    const text2 = document.getElementById('text2');
    const subTitle = document.querySelector('.landing-page-main-sub-title');
    
    const typeText = (textElement, duration) => {
        subTitle.style.width = '0';
        textElement.style.display = 'inline';
        subTitle.style.animation = `typing ${duration}s steps(${textElement.textContent.length}), cursor .4s step-end infinite alternate`;
    };

    const deleteText = (duration) => {
        subTitle.style.animation = `deleting ${duration}s steps(${subTitle.textContent.length})`;
    };

    let isText1Visible = true;

    const loopAnimation = () => {
        if (isText1Visible) {
            deleteText(2);
            setTimeout(() => {
                text1.style.display = 'none';
                typeText(text2, 2);
                isText1Visible = false;
                setTimeout(loopAnimation, 2000);
            }, 2000);
        } else {
            deleteText(2);
            setTimeout(() => {
                text2.style.display = 'none';
                typeText(text1, 2);
                isText1Visible = true;
                setTimeout(loopAnimation, 2000);
            }, 2000);
        }
    };

    setTimeout(loopAnimation, 8000);

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
    
    // Add click event listeners to image blocks
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
    
    

    const carousel = document.querySelector('.promo-carousel');
    const firstImg = carousel.querySelectorAll('img')[0];
    const arrowIcons = document.querySelectorAll('.promo-container i');
    const promoSlider = document.querySelector('.landing-page-promo-slider');

    let isDragStart = false, isDragging = false, prevPageX, prevScrollLeft, positionDiff;
    const scrollWidth = carousel.scrollWidth - carousel.clientWidth;

    const showHideIcons = () => {
        arrowIcons[0].style.display = carousel.scrollLeft === 0 ? 'none' : 'block';
        arrowIcons[1].style.display = carousel.scrollLeft === scrollWidth ? 'none' : 'block';
    };

    const setBackground = (imageSrc) => {
        promoSlider.style.backgroundImage = `url(${imageSrc})`;
    };

    const moveToNextImage = () => {
        const firstImgWidth = firstImg.clientWidth + 14;
        if (carousel.scrollLeft >= scrollWidth) {
            carousel.scrollLeft = 0;
        } else {
            carousel.scrollLeft += firstImgWidth;
        }
        const currentImg = carousel.querySelectorAll('img')[Math.round(carousel.scrollLeft / firstImgWidth)];
        setBackground(currentImg.src);
        showHideIcons();
    };

    arrowIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const firstImgWidth = firstImg.clientWidth + 14;
            carousel.scrollLeft += icon.id === 'left-icon' ? -firstImgWidth : firstImgWidth;
            const currentImg = carousel.querySelectorAll('img')[Math.round(carousel.scrollLeft / firstImgWidth)];
            setBackground(currentImg.src);
            setTimeout(showHideIcons, 60);
        });
    });

    const autoSlide = () => {
        moveToNextImage();
    };

    const dragStart = (e) => {
        isDragStart = true;
        prevPageX = e.pageX || e.touches[0].pageX;
        prevScrollLeft = carousel.scrollLeft;
    };

    const dragging = (e) => {
        if (!isDragStart) return;
        e.preventDefault();
        isDragging = true;
        carousel.classList.add('dragging');
        positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
        carousel.scrollLeft = prevScrollLeft - positionDiff;
        showHideIcons();
    };

    const dragStop = () => {
        isDragStart = false;
        carousel.classList.remove('dragging');
        if (!isDragging) return;
        isDragging = false;
        const currentImg = carousel.querySelectorAll('img')[Math.round(carousel.scrollLeft / (firstImg.clientWidth + 14))];
        setBackground(currentImg.src);
    };

    const centerAndUpdateBackground = (targetImg) => {
        const carouselRect = carousel.getBoundingClientRect();
        const imgRect = targetImg.getBoundingClientRect();
        const offset = imgRect.left - carouselRect.left - (carouselRect.width / 2) + (imgRect.width / 2);
        carousel.scrollLeft += offset;
        showHideIcons();
        setBackground(targetImg.src);
    };

    carousel.addEventListener('mousedown', dragStart);
    carousel.addEventListener('touchstart', dragStart);
    carousel.addEventListener('mousemove', dragging);
    carousel.addEventListener('touchmove', dragging);
    carousel.addEventListener('mouseup', dragStop);
    carousel.addEventListener('mouseleave', dragStop);
    carousel.addEventListener('touchend', dragStop);

    showHideIcons();

    carousel.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', () => {
            centerAndUpdateBackground(img);
        });
    });

    setBackground(firstImg.src);

    const autoMoveCarousel = () => {
        moveToNextImage();
    };

    const autoSlideInterval = setInterval(autoMoveCarousel, 10000);

    arrowIcons.forEach(icon => {
        icon.addEventListener('mouseover', function () {
            this.style.animationDuration = '5s';
        });

        icon.addEventListener('mouseout', function () {
            this.style.animationDuration = '';
        });
    });

    document.getElementById('Login-Button').addEventListener('click', function () {
        window.location.href = '../pages/login.html';
    });


    //<i class="fa-solid fa-x"></i>
    // Check if user is logged in
//     fetch('/check-session')
//     .then(response => response.json())
//     .then(user => {
//         if (user.email) {
//             const welcomeGreeting = document.querySelector('.userGreeting');
//             const cancelDropdown = document.getElementById('cancel-click');
//             const userIcon = document.querySelector('#loginIcon');
//             const userDropMenu = document.querySelector('#user-dropdown');
        
//             userIcon.addEventListener('click', function(event) {
//                 event.stopPropagation(); // Prevent the click event from bubbling up to the document
//                 console.log('click seen');
//                 userDropMenu.classList.remove('login-content-before-click');
//                 userDropMenu.classList.add('login-content-after-click');
//             });
            
//             document.addEventListener('click', function(event) {
//                 if (!userDropMenu.contains(event.target) && !userIcon.contains(event.target)) {
//                     userDropMenu.classList.remove('login-content-after-click');
//                     userDropMenu.classList.add('login-content-before-click');
//                 }
//             });
            
//             cancelDropdown.addEventListener('click',function() {
//                 userDropMenu.classList.remove('login-content-after-click');
//                 userDropMenu.classList.add('login-content-before-click');
//             })
//             // Optionally add a logout button
//             welcomeGreeting.innerHTML = `Hi, ${user.firstName} ${user.lastName}`;
//             const logoutButton = document.getElementById('Logout-Button');
//             const loginIcon = document.getElementById('loginIcon');
//             loginButton.classList.remove('btn-71');
//             loginButton.classList.add('hidden-class');
//             loginIcon.classList.remove('login_icon');
//             loginIcon.classList.add('login_icon-visible');
//             logoutButton.addEventListener('click', () => {
//                 fetch('/logout', { method: 'POST' })
//                     .then(() => {
//                         window.location.reload();
//                     });
//             });
//         }
//     })
//     .catch(err => {
//         console.error('User not logged in');
//     });
// });
    
 
});