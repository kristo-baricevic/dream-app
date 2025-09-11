import gsap from 'gsap';

// Utility function to create and animate the shooting star
export function createShootingStar() {
  console.log('animating...');
  // Create shooting star element
  const shootingStar = document.createElement('div');
  shootingStar.id = 'shooting-star';
  shootingStar.style.position = 'absolute';
  shootingStar.style.width = '15px';
  shootingStar.style.height = '15px';
  shootingStar.style.borderRadius = '100%';
  shootingStar.style.backgroundColor = '#ece75f';
  document.body.appendChild(shootingStar);

  // Set initial position of the shooting star
  gsap.set(shootingStar, { x: -20, y: 20 });

  // Animate the shooting star
  gsap.to(shootingStar, {
    x: window.innerWidth + 20,
    y: -700,
    rotation: 260,
    duration: 1,
    delay: 4,
    curviness: 1.5,
    ease: 'none',
    onComplete: () => {
      shootingStar.remove();
    },
  });
}
