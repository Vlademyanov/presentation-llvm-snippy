import { showSlide as showSlide1 } from './slides/slide1.js';
import { showSlide as showSlide2 } from './slides/slide2.js';

const terminal = document.getElementById('terminal');
const inputField = document.getElementById('input');

let stage = 0; // 0 - ожидаем CMake, 1 - ждём build, 2 - ждём install, 3 - режим презентации
let presentationMode = null;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAutoSequence() {
    const lines = [
        "Compiling slide1.cpp...",
        "Compiling slide2.cpp...",
        "Linking executable...",
        "Optimizing assets...",
        "Build successful!",
        "",
        "Installing...",
        "Installation complete!",
        "",
        "Запуск презентации..."
    ];

    for (let line of lines) {
        terminal.innerHTML += line + "\n";
        await delay(800);
    }

    showSlide1(terminal);
    await delay(1500);
    showSlide2(terminal);
    await delay(1500);

    terminal.innerHTML += "\nАвтоматическая презентация завершена.";
    inputField.style.display = 'none';
}

function runManualMode() {
    terminal.innerHTML += "Ручной режим активирован. Введите 'help' для списка команд.\n";
    inputField.style.display = 'block';
    inputField.focus();
}

function processCommand(command) {
    terminal.innerHTML += "> " + command + "\n";

    if (stage === 0 && command.startsWith("cmake -S presentation -B build -G Ninja -C config.cmake")) {
        terminal.innerHTML += "Configuring project...\n";
        terminal.innerHTML += "Generating Ninja files...\n";
        terminal.innerHTML += "CMake configuration complete.\n";
        stage = 1;
        return;
    }

    if (stage === 1 && command === "cmake --build build") {
        terminal.innerHTML += "Building project...\n";
        stage = 2;
        return;
    }

    if (stage === 2 && command.startsWith("cmake --install build")) {
        terminal.innerHTML += "Installing presentation...\n";
        stage = 3;

        if (command.includes("--auto")) {
            presentationMode = 'auto';
            runAutoSequence();
        } else {
            presentationMode = 'manual';
            runManualMode();
        }
        return;
    }

    if (presentationMode === 'manual') {
        switch (command.toLowerCase()) {
            case 'help':
                terminal.innerHTML += "Доступные команды:\n";
                terminal.innerHTML += "  slide1  - Показать слайд 1\n";
                terminal.innerHTML += "  slide2  - Показать слайд 2\n";
                terminal.innerHTML += "  exit    - Завершить презентацию\n";
                break;
            case 'slide1':
                terminal.innerHTML += "Переход к слайду 1...\n";
                showSlide1(terminal);
                break;
            case 'slide2':
                terminal.innerHTML += "Переход к слайду 2...\n";
                showSlide2(terminal);
                break;
            case 'exit':
                terminal.innerHTML += "Завершение презентации...\n";
                inputField.disabled = true;
                break;
            default:
                terminal.innerHTML += "Неизвестная команда. Введите 'help'.\n";
        }
        return;
    }

    terminal.innerHTML += "Ошибка: неверный порядок команд или синтаксис.\n";
}

inputField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        processCommand(inputField.value.trim());
        inputField.value = "";
    }
});