window.addEventListener('DOMContentLoaded', () => {
  const clockElement = document.getElementById('clock');

  function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    clockElement.textContent = `${hours}:${minutes}`;
  }

  // Actualiza cada minuto exacto
  updateClock();
  setInterval(updateClock, 60 * 1000);
});
