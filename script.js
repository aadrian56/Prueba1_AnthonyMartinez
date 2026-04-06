document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-scroll').forEach(el => observer.observe(el));

    // --- 2. Interactive Particle System ---
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray = [];

    // Set canvas size
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    setCanvasSize();

    // Mouse object for interaction
    let mouse = {
        x: null,
        y: null,
        radius: 180 // Area of influence
    };

    // Mouse event listeners
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    // Prevent particles getting stuck when mouse leaves window
    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    // Handle resize
    window.addEventListener('resize', () => {
        setCanvasSize();
        initParticles(); // Re-initialize to cover new area properly
    });

    // Particle Class
    class Particle {
        constructor(x, y, dx, dy, size, color) {
            this.x = x;
            this.y = y;
            this.dx = dx; // Velocity X
            this.dy = dy; // Velocity Y
            this.size = size;
            this.color = color;
            this.baseColor = color;
            this.density = (Math.random() * 30) + 1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Add subtle glow to larger particles
            if (this.size > 1.8) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
            } else {
                ctx.shadowBlur = 0;
            }
        }

        update() {
            // Check bounds & bounce
            if (this.x > canvas.width || this.x < 0) {
                this.dx = -this.dx;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.dy = -this.dy;
            }

            // Mouse Interaction (Repulsion & Connect effect)
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    // Repulsion force
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = forceDirectionX * force * this.density * 0.5;
                    const directionY = forceDirectionY * force * this.density * 0.5;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                    
                    // Highlight color when interacting
                    this.color = '#ffffff';
                } else {
                    // Revert to original color smoothly
                    this.color = this.baseColor;
                }
            } else {
                this.color = this.baseColor;
            }

            // Apply standard movement
            this.x += this.dx;
            this.y += this.dy;

            this.draw();
        }
    }

    // Initialize Particle System
    function initParticles() {
        particlesArray = [];
        // Dynamic particle count based on screen size to maintain performance
        let numberOfParticles = Math.floor((canvas.height * canvas.width) / 12000);
        
        // Cap particles avoiding lag on very large screens
        if(numberOfParticles > 300) numberOfParticles = 300; 
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 0.5;
            let x = Math.random() * (canvas.width - size * 2) + size * 2;
            let y = Math.random() * (canvas.height - size * 2) + size * 2;
            let dx = (Math.random() * 1) - 0.5; // Speed multiplier X
            let dy = (Math.random() * 1) - 0.5; // Speed multiplier Y
            
            // Thematic colors: Main Cyan, Secondary Purple, some subtle white
            let colorVal = Math.random();
            let color = '#00f3ff'; // Cyan
            if(colorVal > 0.6) color = '#bc13fe'; // Purple
            if(colorVal > 0.9) color = 'rgba(255, 255, 255, 0.5)'; // Faded white

            particlesArray.push(new Particle(x, y, dx, dy, size, color));
        }
    }

    // Connect nearby particles with lines (Constellation effect)
    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = (dx * dx) + (dy * dy);
                
                // If particles are close enough, draw line
                const connectionDistance = (canvas.width / 15) * (canvas.height / 15);
                
                if (distance < connectionDistance) {
                    opacityValue = 1 - (distance / connectionDistance);
                    // Cyan lines based on proximity
                    ctx.strokeStyle = `rgba(0, 243, 255, ${opacityValue * 0.25})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Main Animation Loop
    function animateParticles() {
        requestAnimationFrame(animateParticles);
        // Clear canvas but leave a slight trail for smooth motion
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
    }

    // Kick off
    initParticles();
    animateParticles();
});
