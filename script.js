// -----------------------------------------------------------
// 1. КОНФИГУРАЦИЯ
// -----------------------------------------------------------
// ВАШ API-КЛЮЧ: 
const API_KEY = "81f7baf7815a06b27c1c2bc6045aa0e3"; 
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

// -----------------------------------------------------------
// 2. БАЗА ДАННЫХ ГАРДЕРОБА (Ваша логическая модель)
// -----------------------------------------------------------
// Логика: чем выше в списке предмет, тем он "теплее" (нужен при более низких температурах).
const WARDROBE_DATA = [
    // Верхняя одежда (нужно выбрать только 1, программа выберет первый подходящий)
    { category: "Верхняя одежда", name: "Плотный зимний пуховик", min_t: -20, max_t: -5, rain_proof: false },
    { category: "Верхняя одежда", name: "Теплое шерстяное пальто", min_t: -5, max_t: 5, rain_proof: false },
    { category: "Верхняя одежда", name: "Демисезонная куртка/плащ", min_t: 5, max_t: 15, rain_proof: true },
    { category: "Верхняя одежда", name: "Легкая ветровка", min_t: 15, max_t: 25, rain_proof: true },
    { category: "Верхняя одежда", name: "Отсутствует (только футболка)", min_t: 25, max_t: 50, rain_proof: false },
    
    // Основной слой
    { category: "Основной слой", name: "Термобелье и свитер", min_t: -20, max_t: 0, rain_proof: false },
    { category: "Основной слой", name: "Лонгслив или легкий свитер", min_t: 0, max_t: 15, rain_proof: false },
    { category: "Основной слой", name: "Футболка или рубашка", min_t: 15, max_t: 50, rain_proof: false },
    
    // Низ
    { category: "Низ", name: "Теплые брюки с начесом", min_t: -20, max_t: 0, rain_proof: false },
    { category: "Низ", name: "Джинсы/Плотные брюки", min_t: 0, max_t: 20, rain_proof: false },
    { category: "Низ", name: "Шорты/Легкая юбка", min_t: 20, max_t: 50, rain_proof: false },

    // Обувь
    { category: "Обувь", name: "Зимние ботинки", min_t: -20, max_t: 0, rain_proof: true },
    { category: "Обувь", name: "Кожаные ботинки/Кроссовки", min_t: 0, max_t: 15, rain_proof: true },
    { category: "Обувь", name: "Легкие кроссовки/Туфли", min_t: 15, max_t: 50, rain_proof: false },
    
    // Аксессуары
    { category: "Аксессуар", name: "Шапка, перчатки и шарф", min_t: -10, max_t: 5, rain_proof: false },
    { category: "Аксессуар", name: "Легкий шарф или перчатки", min_t: 5, max_t: 15, rain_proof: false }
];

// -----------------------------------------------------------
// 3. ФУНКЦИЯ ЗАПРОСА ПОГОДЫ (Получает данные через API)
// -----------------------------------------------------------
async function fetchWeather(city) {
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=ru`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            const temp = Math.round(data.main.temp); 
            // Проверяем на осадки (Rain, Snow, Drizzle, Thunderstorm)
            const weather_code = data.weather[0].main;
            const is_rainy = ['Rain', 'Snow', 'Drizzle', 'Thunderstorm'].includes(weather_code);

            return { temp, is_rainy, description: data.weather[0].description };
        } else {
            throw new Error(`Город "${city}" не найден или ошибка в API-ключе.`);
        }
    } catch (error) {
        throw new Error("Ошибка подключения к сервису погоды.");
    }
}

// -----------------------------------------------------------
// 4. ОСНОВНОЙ АЛГОРИТМ ПОДБОРА (Ядро проекта)
// -----------------------------------------------------------
function recommendClothes(temp, is_rainy) {
    const recommendations = {}; 

    for (const item of WARDROBE_DATA) {
        const category = item.category;

        // 1. Фильтр по температурному диапазону (самый важный критерий)
        if (temp >= item.min_t && temp <= item.max_t) {
            
            // 2. Фильтр по осадкам (если есть осадки, нужна защита)
            if (!is_rainy || item.rain_proof) {
                
                // 3. Выбор лучшего в категории: 
                // Берем только первый (самый подходящий) элемент в каждой категории
                if (!recommendations[category]) {
                    recommendations[category] = item.name;
                }
            }
        }
    }
    
    // 4. Добавление обязательного Зонта при осадках (если его еще нет)
    if (is_rainy) {
        recommendations['Аксессуар (Защита)'] = 'Зонт';
    }
    
    return recommendations;
}

// -----------------------------------------------------------
// 5. ГЛАВНАЯ ФУНКЦИЯ (Связывает логику с интерфейсом)
// -----------------------------------------------------------
async function getRecommendation() {
    const cityInput = document.getElementById('city-input');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error-message');
    
    const city = cityInput.value.trim();

    resultsDiv.innerHTML = '';
    errorDiv.style.display = 'none';

    if (city === "") {
        errorDiv.textContent = "Пожалуйста, введите название города.";
        errorDiv.style.display = 'block';
        return;
    }

    // Показываем, что идет загрузка
    loadingDiv.style.display = 'block';

    try {
        // Шаг 1: Получаем погоду
        const weather = await fetchWeather(city);
        
        // Шаг 2: Применяем алгоритм
        const recommendations = recommendClothes(weather.temp, weather.is_rainy);
        
        // Шаг 3: Выводим результат в HTML
        
        let outputHTML = `<p>Погода в <strong>${city}</strong>: **${weather.temp}°C** . (${weather.description})</p>`;
        outputHTML += `<p>Осадки: <strong>${weather.is_rainy ? 'Идут' : 'Нет'}</strong></p>`;
        outputHTML += '<p>Наш выбор:</p>';
        
        for (const category in recommendations) {
            outputHTML += `<div class="recommendation-item"><strong>${category}:</strong> ${recommendations[category]}</div>`;
        }
        
        resultsDiv.innerHTML = outputHTML;

    } catch (error) {
        errorDiv.textContent = `Ошибка: ${error.message}`;
        errorDiv.style.display = 'block';
    } finally {
        loadingDiv.style.display = 'none';
    }
}


// -----------------------------------------------------------
// ИНИЦИАЛИЗАЦИЯ (Для удобства тестирования с вашим городом)
// -----------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Автоматический ввод вашего города при загрузке страницы
    const cityInput = document.getElementById('city-input');
    if (cityInput) {
        cityInput.value = "Timashevsk"; 
    }
});