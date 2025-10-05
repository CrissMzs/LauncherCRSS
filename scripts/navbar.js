const { getValue } = require('../services/getValueOnConfig');

window.addEventListener('DOMContentLoaded', () => {
  const username = getValue('username') || 'Usuario';
  const navbar = document.getElementById('welcome-message');
  navbar.textContent = `Wellcome, ${username}`;
});
