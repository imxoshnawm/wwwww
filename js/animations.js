document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll with enhanced easing
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Enhanced scroll reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Stagger effect بۆ child elements
                if (entry.target.classList.contains('projects-grid')) {
                    entry.target.querySelectorAll('.item-card').forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 100);
                    });
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.scroll-reveal').forEach(element => {
        observer.observe(element);
    });

    // Parallax effect بۆ hero section
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero');
        const scrolled = window.pageYOffset;
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    });

    // Hover effects بۆ item cards
    document.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const image = card.querySelector('.item-image');
            image.style.transform = 'scale(1.05)';
        });

        card.addEventListener('mouseleave', () => {
            const image = card.querySelector('.item-image');
            image.style.transform = 'scale(1)';
        });
    });
});