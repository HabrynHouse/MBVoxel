export function isMobileDevice(): boolean {
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < 1024)
  );
}

export function isTouchDevice(): boolean {
  return navigator.maxTouchPoints > 0 || isMobileDevice();
}
