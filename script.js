// -----------------------------------------------------------
// 1. КОНФИГУРАЦИЯ
// -----------------------------------------------------------
// ВАШ API-КЛЮЧ (Проверен и работает с OpenWeatherMap):
const API_KEY = "81f7baf7815a06b27c1c2bc6045aa0e3"; 
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

// -----------------------------------------------------------
// 2. БАЗА ДАННЫХ ГАРДЕРОБА (С иконками)
// -----------------------------------------------------------
const WARDROBE_DATA = [
    // Верхняя одежда
    { category: "Верхняя одежда", name: "Плотный зимний пуховик", min_t: -20, max_t: -5, rain_proof: false, icon: "🧥" },
    { category: "Верхняя одежда", name: "Теплое шерстяное пальто", min_t: -5, max_t: 5, rain_proof: false, icon: "🧣" },
    { category: "Верхняя одежда", name: "Демисезонная куртка/плащ", min_t: 5, max_t: 15, rain_proof: true, icon: "🧥" },
    { category: "Верхняя одежда", name: "Легкая ветровка", min_t: 15, max_t: 25, rain_proof: true, icon: "💨" },
    { category: "Верхняя одежда", name: "Отсутствует (только футболка)", min_t: 25, max_t: 50, rain_proof: false, icon: "☀️" },
    
    // Основной слой
    { category: "Основной слой", name: "Термобелье и свитер", min_t: -20, max_t: 0, rain_proof: false, icon: "🧤" },
    { category: "Основной слой", name: "Лонгслив или легкий свитер", min_t: 0, max_t: 15, rain_proof: false, icon: "👕" },
    { category: "Основной слой", name: "Футболка или рубашка", min_t: 15, max_t: 50, rain_proof: false, icon: "👚" },
    
    // Низ
    { category: "Низ", name: "Теплые брюки с начесом", min_t: -20, max_t: 0, rain_proof: false, icon: "👖" },
    { category: "Низ", name: "Джинсы/Плотные брюки", min_t: 0, max_t: 20, rain_proof: false, icon: "👖" },
    { category: "Низ", name: "Шорты/Легкая юбка", min_t: 20, max_t: 50, rain_proof: false, icon: "🩳" },

    // Обувь
    { category: "Обувь", name: "Зимние ботинки", min_t: -20, max_t: 0, rain_proof: true, icon: "👢" },
    { category: "Обувь", name: "Кожаные ботинки/Кроссовки", min_t: 0, max_t: 15, rain_proof: true, icon: "👟" },
    { category: "Обувь", name: "Легкие кроссовки/Туфли", min_t: 15, max_t: 50, rain_proof: false, icon: "👟" },
    
    // Аксессуары
    { category: "Аксессуар", name: "Шапка, перчатки и шарф", min_t: -10, max_t: 5, rain_proof: false, icon: "❄️" },
    { category: "Аксессуар", name: "Легкий шарф или перчатки", min_t: 5, max_t: 15, rain_proof: false, icon: "🧣" }
];

// -----------------------------------------------------------
// 3. ФУНКЦИЯ ЗАПРОСА ПОГОДЫ 
// -----------------------------------------------------------
async function fetchWeather(city) {
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=ru`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            const temp = Math.round(data.main.temp); 
            const weather_code = data.weather[0].main;
            const is_rainy = ['Rain', 'Snow', 'Drizzle', 'Thunderstorm'].includes(weather_code);
            
            // Определяем эмодзи погоды
            let weather_emoji = '';
            if (weather_code === 'Clear') weather_emoji = '☀️';
            else if (weather_code === 'Clouds') weather_emoji = '☁️';
            else if (weather_code === 'Rain' || weather_code === 'Drizzle') weather_emoji = '🌧️';
            else if (weather_code === 'Snow') weather_emoji = '❄️';
            else if (weather_code === 'Thunderstorm') weather_emoji = '⛈️';
            else weather_emoji = '❓';

            return { 
                temp, 
                is_rainy, 
                description: data.weather[0].description,
                weather_emoji
            };
        } else {
            throw new Error(`Город "${city}" не найден или ошибка в API-ключе.`);
        }
    } catch (error) {
        throw new Error("Ошибка подключения к сервису погоды.");
    }
}

// -----------------------------------------------------------
// 4. ОСНОВНОЙ АЛГОРИТМ ПОДБОРА 
// -----------------------------------------------------------
function recommendClothes(temp, is_rainy) {
    const recommendations = {}; 

    for (const item of WARDROBE_DATA) {
        const category = item.category;

        if (temp >= item.min_t && temp <= item.max_t) {
            if (!is_rainy || item.rain_proof) {
                if (!recommendations[category]) {
                    recommendations[category] = { 
                        name: item.name, 
                        icon: item.icon 
                    }; 
                }
            }
        }
    }
    
    // Добавляем Зонт при осадках
    if (is_rainy) {
        recommendations['Аксессуар (Защита)'] = { 
            name: 'Зонт', 
            icon: '☔' 
        };
    }
    
    // Получаем дополнительные советы
    const tips = getSmartTips(temp, is_rainy);
    
    return { recommendations, tips };
}

// -----------------------------------------------------------
// 5. ФУНКЦИЯ: Умные Советы ("Фишки")
// -----------------------------------------------------------
function getSmartTips(temp, is_rainy) {
    const tips = [];
    
    if (temp <= 5) {
        tips.push({ text: "Не забудьте проверить срок годности антифриза для вашего автомобиля!", icon: "🚗" });
    }
    if (temp >= 25) {
        tips.push({ text: "Пейте больше воды и используйте солнцезащитный крем.", icon: "💧" });
    }
    if (is_rainy) {
        tips.push({ text: "Выбирайте водонепроницаемую обувь и одежду, даже если наш алгоритм предложил другое.", icon: "🛡️" });
    }
    if (temp >= -5 && temp <= 5 && !is_rainy) {
        tips.push({ text: "Идеальная погода для прогулки. Одевайтесь многослойно.", icon: "🌲" });
    }
    if (temp < 0 && !is_rainy) {
        tips.push({ text: "На дорогах может быть гололед. Будьте осторожны!", icon: "⚠️" });
    }
    
    return tips;
}


// -----------------------------------------------------------
// 6. ГЛАВНАЯ ФУНКЦИЯ УПРАВЛЕНИЯ И ИНТЕРФЕЙСА
// -----------------------------------------------------------
async function getRecommendation() {
    const cityInput = document.getElementById('city-input');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error-message');
    const tipsDiv = document.getElementById('tips'); 
    
    const city = cityInput.value.trim();

    resultsDiv.innerHTML = '';
    errorDiv.style.display = 'none';
    tipsDiv.innerHTML = ''; 
    
    if (city === "") { 
        errorDiv.textContent = "Пожалуйста, введите название города.";
        errorDiv.style.display = 'block';
        return;
    }

    loadingDiv.style.display = 'block';

    try {
        const weather = await fetchWeather(city);
        const { recommendations, tips } = recommendClothes(weather.temp, weather.is_rainy); 
        
        // ---- ВЫВОД ПОГОДЫ ----
        let outputHTML = `
            <div class="weather-info">
                <span>${weather.weather_emoji}</span> Погода в <strong>${city}</strong>: 
                <span class="temp-display">${weather.temp}°C</span> 
                (${weather.description}).
                <p>Осадки: <strong>${weather.is_rainy ? 'Идут' : 'Нет'}</strong></p>
            </div>
            <h3>Ваш образ:</h3>
            <div class="recommendations-grid">
        `;
        
        // ---- ВЫВОД ОДЕЖДЫ (Карточки) ----
        for (const category in recommendations) {
            const item = recommendations[category];
            outputHTML += `
                <div class="recommendation-item">
                    <span class="item-icon">${item.icon}</span>
                    <div class="item-details">
                        <span class="item-category">${category}:</span>
                        <span class="item-name">${item.name}</span>
                    </div>
                </div>
            `;
        }
        outputHTML += `</div>`; 
        
        resultsDiv.innerHTML = outputHTML;

        // ---- ВЫВОД СОВЕТОВ ----
        if (tips.length > 0) {
            let tipsHTML = '<h3>✨ Умные советы:</h3><ul>';
            tips.forEach(tip => {
                tipsHTML += `<li><span class="tip-icon">${tip.icon}</span> ${tip.text}</li>`;
            });
            tipsHTML += '</ul>';
            tipsDiv.innerHTML = tipsHTML;
        }

    } catch (error) {
        errorDiv.textContent = `Ошибка: ${error.message}`;
        errorDiv.style.display = 'block';
    } finally {
        loadingDiv.style.display = 'none';
    }
}


// -----------------------------------------------------------
// ИНИЦИАЛИЗАЦИЯ 
// -----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    if (cityInput) {
        cityInput.value = "Timashevsk"; 
    }
});

