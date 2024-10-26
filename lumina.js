document.addEventListener('DOMContentLoaded', () => {
    // ページ読み込み時にスクロールを無効にする
    document.body.classList.add('no-scroll');

    const initialAnimation = document.getElementById('initial-animation');
    const texts = document.querySelectorAll('.text');
    const header = document.querySelector('header');
    const serviceItems = document.querySelectorAll('.service-item');
    
    // 初期アニメーション
    texts.forEach((text, index) => {
        setTimeout(() => {
            text.style.opacity = '1';
            text.style.transform = 'translateY(0)';
        }, index * 500);
    });
    
    // 5秒後にスクロールを有効にする
    setTimeout(() => {
        document.body.classList.remove('no-scroll');
    }, 5000);

    setTimeout(() => {
        initialAnimation.style.transition = 'background-color 1s, opacity 1s';
        initialAnimation.style.backgroundColor = 'black';
        texts.forEach(text => {
            text.style.color = 'white';
        });
        
        setTimeout(() => {
            initialAnimation.style.opacity = '0';
            
            setTimeout(() => {
                initialAnimation.style.display = 'none';
                startParticleAnimation();
                header.classList.add('visible');
                initArrowAnimation();
            }, 1000);
        }, 1000);
    }, 2500);

    // サービス項目のフェードインアニメーション
    let delay = 0;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                }, delay);
                delay += 500;
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    serviceItems.forEach((item) => {
        observer.observe(item);
    });
});

function startParticleAnimation() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('animation-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const textureSize = 64;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(
        textureSize / 2, textureSize / 2, 0,
        textureSize / 2, textureSize / 2, textureSize / 2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    const texture = new THREE.CanvasTexture(canvas);

    const particles = [];
    const particleSizes = [];
    const particleCount = 1000;

    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Vector3(
            Math.random() * 2000 - 1000,
            Math.random() * 400 - 100,
            Math.random() * 2000 - 1000
        );
        particle.velocity = new THREE.Vector3(
            Math.random() * 2 - 1,
            (Math.random() * 2 - 1) * 0.3,
            Math.random() * 2 - 1
        );
        particles.push(particle);
        particleSizes.push(Math.random() * 15 + 10);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(particles);
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(particleSizes, 1));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true,
        map: texture,
        depthWrite: false,
        size: 5
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    camera.position.z = 1000;

    function animate() {
        requestAnimationFrame(animate);

        particles.forEach((particle, index) => {
            particle.add(particle.velocity);

            if (particle.x < -1000 || particle.x > 1000) particle.velocity.x = -particle.velocity.x;
            if (particle.y < -100 || particle.y > 300) particle.velocity.y = -particle.velocity.y;
            if (particle.z < -1000 || particle.z > 1000) particle.velocity.z = -particle.velocity.z;

            geometry.attributes.position.array[index * 3] = particle.x;
            geometry.attributes.position.array[index * 3 + 1] = particle.y;
            geometry.attributes.position.array[index * 3 + 2] = particle.z;
        });

        geometry.attributes.position.needsUpdate = true;

        particleSystem.rotation.y += 0.002;

        renderer.render(scene, camera);
    }

    camera.position.z = 1500;
    camera.position.y = 100;
    camera.lookAt(0, 0, 0);

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initArrowAnimation() {
    const arrowContainer = document.querySelector('.arrow-container');
    const arrow = document.querySelector('.arrow');
    
    arrowContainer.style.height = '60px';
    
    arrow.style.transform = 'translateY(-100%)';
    
    function animateArrow() {
        arrow.animate([
            { transform: 'translateY(-100%)' },
            { transform: 'translateY(0)' }
        ], {
            duration: 1000,
            easing: 'ease-in-out'
        }).onfinish = () => {
            arrow.animate([
                { transform: 'translateY(0)' },
                { transform: 'translateY(-100%)' }
            ], {
                duration: 1000,
                easing: 'ease-in-out'
            }).onfinish = () => {
                setTimeout(animateArrow, 500);
            };
        };
    }
    
    animateArrow();
}

let animationProgress = 0;
let servicesAnimationProgress = 0;
let lastScrollPosition = 0;
let neuralNetworkInitialized = false;
let servicesNeuralNetworkInitialized = false;
let animationFrameId = null;
let servicesAnimationFrameId = null;

function initNeuralNetwork() {
    const canvas = document.getElementById('neural-network');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const branches = [];
    const maxDepth = 9;

    function createBranch(x, y, angle, depth) {
        return {
            x: x,
            y: y,
            angle: angle,
            depth: depth,
            length: 0,
            maxLength: Math.random() * 60 + 60,
            growing: true,
            children: []
        };
    }

    function growBranch(branch, progress, canvasHeight) {
        const targetLength = branch.maxLength * progress;
        if (branch.length < targetLength) {
            branch.length = Math.min(branch.length + 5, targetLength);
            branch.growing = true;
        } else if (branch.length > targetLength) {
            branch.length = Math.max(branch.length - 5, targetLength);
            branch.growing = false;
        }

        if (branch.growing && branch.length >= branch.maxLength && branch.depth < maxDepth) {
            if (branch.children.length === 0) {
                const numChildren = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < numChildren; i++) {
                    const newAngle = branch.angle + (Math.random() - 0.5) * Math.PI / 3;
                    const childBranch = createBranch(
                        branch.x + Math.cos(branch.angle) * branch.length,
                        branch.y + Math.sin(branch.angle) * branch.length,
                        newAngle,
                        branch.depth + 1
                    );
                    branch.children.push(childBranch);
                    branches.push(childBranch);
                }
            }
        }

        // 最下層の枝を下端まで伸ばす
        if (branch.depth === maxDepth - 1 && branch.y + branch.length * Math.sin(branch.angle) < canvasHeight) {
            branch.maxLength = (canvasHeight - branch.y) / Math.sin(branch.angle);
        }

        branch.children.forEach(child => growBranch(child, progress, canvasHeight));
    }

    function drawBranch(branch) {
        ctx.beginPath();
        ctx.moveTo(branch.x, branch.y);
        const endX = branch.x + Math.cos(branch.angle) * branch.length;
        const endY = branch.y + Math.sin(branch.angle) * branch.length;
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - branch.depth / maxDepth})`;
        ctx.lineWidth = maxDepth - branch.depth + 1;
        ctx.stroke();
        branch.children.forEach(drawBranch);
    }

    const rootBranch = createBranch(canvas.width / 2, 0, Math.PI / 2, 0);
    branches.push(rootBranch);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        growBranch(rootBranch, animationProgress, canvas.height);
        drawBranch(rootBranch);
        animationFrameId = requestAnimationFrame(animate);
    }

    animate();
}

function initServicesNeuralNetwork() {
    const canvas = document.getElementById('services-neural-network');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const branches = [];
    const maxDepth = 12;

    function createBranch(x, y, angle, depth) {
        return {
            x: x,
            y: y,
            angle: angle,
            depth: depth,
            length: 0,
            maxLength: Math.random() * 100 + 100,
            growing: true,
            children: []
        };
    }

    function growBranch(branch, progress, canvasHeight) {
        const targetLength = branch.maxLength * progress;
        if (branch.length < targetLength) {
            branch.length = Math.min(branch.length + 12, targetLength);
            branch.growing = true;
        } else if (branch.length > targetLength) {
            branch.length = Math.max(branch.length - 12, targetLength);
            branch.growing = false;
        }

        if (branch.growing && branch.length >= branch.maxLength && branch.depth < maxDepth) {
            if (branch.children.length === 0) {
                const numChildren = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < numChildren; i++) {
                    const newAngle = branch.angle + (Math.random() - 0.5) * Math.PI / 3;
                    const childBranch = createBranch(
                        branch.x + Math.cos(branch.angle) * branch.length,
                        branch.y + Math.sin(branch.angle) * branch.length,
                        newAngle,
                        branch.depth + 1
                    );
                    branch.children.push(childBranch);
                    branches.push(childBranch);
                }
            }
        }

        // 最下層の枝を下端まで伸ばす
        if (branch.depth === maxDepth - 1 && branch.y + branch.length * Math.sin(branch.angle) < canvasHeight) {
            branch.maxLength = (canvasHeight - branch.y) / Math.sin(branch.angle);
        }

        branch.children.forEach(child => growBranch(child, progress, canvasHeight));
    }

    function drawBranch(branch) {
        ctx.beginPath();
        ctx.moveTo(branch.x, branch.y);
        const endX = branch.x + Math.cos(branch.angle) * branch.length;
        const endY = branch.y + Math.sin(branch.angle) * branch.length;
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - branch.depth / maxDepth})`;
        ctx.lineWidth = maxDepth - branch.depth + 1;
        ctx.stroke();
        branch.children.forEach(drawBranch);
    }

    const rootBranch = createBranch(canvas.width / 2, 0, Math.PI / 2, 0);
    branches.push(rootBranch);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        growBranch(rootBranch, servicesAnimationProgress, canvas.height);
        drawBranch(rootBranch);
        servicesAnimationFrameId = requestAnimationFrame(animate);
    }

    animate();
}

function updateNeuralNetwork() {
    const aboutSection = document.getElementById('about');
    const rect = aboutSection.getBoundingClientRect();
    const sectionHeight = aboutSection.offsetHeight;
    const viewportHeight = window.innerHeight;

    if (rect.top <= viewportHeight && rect.bottom >= 0) {
        const scrollPosition = window.pageYOffset;
        const scrollDirection = scrollPosition > lastScrollPosition ? 1 : -1;
        lastScrollPosition = scrollPosition;

        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const progress = visibleHeight / sectionHeight;

        animationProgress = Math.max(0, Math.min(1, animationProgress + 0.05 * scrollDirection));

        if (!neuralNetworkInitialized) {
            initNeuralNetwork();
            neuralNetworkInitialized = true;
        }
    }
}

let lastProgress = 0;

function updateServicesNeuralNetwork() {
    const servicesSection = document.getElementById('services');
    const rect = servicesSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // セクションが画面に入り始めたら即座に開始
    if (rect.top <= viewportHeight) {
        // プログレスの計算方法
        const progress = Math.max(0, Math.min(1, 1 - (rect.top / viewportHeight)));

        // 上スクロール時の消える速度を調整
        if (progress < lastProgress) {
            // 上にスクロールしている場合、消える速度を早める
            servicesAnimationProgress = Math.max(0, servicesAnimationProgress - 0.05);
        } else {
            // 下にスクロールしている場合は通常の速度
            servicesAnimationProgress = progress;
        }

        lastProgress = progress;

        if (!servicesNeuralNetworkInitialized) {
            initServicesNeuralNetwork();
            servicesNeuralNetworkInitialized = true;
        }
    }
}

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateNeuralNetwork();
            updateServicesNeuralNetwork();
            ticking = false;
        });
        ticking = true;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateNeuralNetwork();
    updateServicesNeuralNetwork();
});
