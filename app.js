const terminal = document.getElementById("terminal");
const username = "user";
const hostname = "presentation-pc";
let currentSlide = 0;
const slides = ["slide1.png", "slide2.png", "slide3.png", "slide4.png", "slide5.png", "slide6.png", "slide7.png", "slide8.png"];

/** Функция для автоматической прокрутки терминала до самого низа */
function scrollToBottom() {
    terminal.scrollTop = terminal.scrollHeight;
}

/** Функция для вывода текста в терминале.
 *  Каждый вызов добавляет строку в конец и вызывает scrollToBottom().
 */
function print(text, newLine = true) {
    terminal.innerHTML += text + (newLine ? "\n" : "");
    scrollToBottom();
}

/** Формирует приглашение (prompt) как в Linux */
function getPrompt() {
    return `<span style="color:#6A9FB5">${username}@${hostname}</span>:<span style="color:#B5BD68">~</span>$ `;
}

/** Имитация сборки (вывод команд cmake) */
function startBuildProcess() {
    print(getPrompt() + "cmake -S llvm -B release/build -G Ninja -C release.cmake");
    setTimeout(() => {
        print(getPrompt() + "cmake --build release/build");
        setTimeout(() => {
            print(getPrompt() + "cmake --install release/build");
            setTimeout(() => {
                print("Build completed successfully!\n");
                loadSlide();
                // В авто-режиме устанавливаем обработчики для переключения слайдов
                document.addEventListener("contextmenu", autoNextSlide);
                document.addEventListener("touchend", autoNextSlide);
            }, 1000);
        }, 1000);
    }, 1000);
}

/** Функция для вывода слайда (команда и изображение) */
function loadSlide() {
    if (currentSlide >= slides.length) {
        print("Presentation finished!");
        // Удаляем обработчики, если презентация закончилась
        document.removeEventListener("contextmenu", autoNextSlide);
        document.removeEventListener("touchend", autoNextSlide);
        return;
    }
    // Выводим строку команды для отображения слайда
    print(getPrompt() + `cat slides/${slides[currentSlide]}`);

    // Создаём контейнер для слайда (изображения)
    const slideContainer = document.createElement("div");
    slideContainer.classList.add("slide-container");
    const img = document.createElement("img");
    img.src = `slides/${slides[currentSlide]}`;
    img.alt = `Slide ${currentSlide + 1}`;
    slideContainer.appendChild(img);

    // Добавляем слайд в конец терминала и прокручиваем вниз
    terminal.appendChild(slideContainer);
    scrollToBottom();
}

/** Обработчик переключения слайда для авто-режима.
 *  При правом клике или касании выводится новый prompt, затем через небольшой таймаут загружается следующий слайд.
 */
function autoNextSlide(e) {
    e.preventDefault();
    // Удаляем обработчики на время переключения, чтобы не было множественных срабатываний
    document.removeEventListener("contextmenu", autoNextSlide);
    document.removeEventListener("touchend", autoNextSlide);

    print(getPrompt());
    setTimeout(() => {
        currentSlide++;
        loadSlide();
        // После загрузки слайда вновь добавляем обработчики
        document.addEventListener("contextmenu", autoNextSlide);
        document.addEventListener("touchend", autoNextSlide);
    }, 300);
}

// Запускаем процесс сборки сразу при загрузке страницы
startBuildProcess();