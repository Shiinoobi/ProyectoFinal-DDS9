import { updateNavbar, protectPage } from '../../src/util/sesion.js';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar()
    protectPage()
})