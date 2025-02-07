// slide2.js
// Экспорт функции, которая выводит содержимое второго слайда
export function showSlide(terminalElement) {
    terminalElement.innerHTML += "\n=== Слайд 2 ===\n";
    terminalElement.innerHTML += "Это второй слайд презентации.\n";
    terminalElement.innerHTML += "Продолжаем знакомство с материалом.\n\n";
}