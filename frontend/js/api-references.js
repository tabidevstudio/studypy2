/* ── Tab filter ── */
document.querySelectorAll('.api-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.api-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        document.querySelectorAll('.api-card').forEach(card => {
            if (filter === 'all') {
                card.style.display = '';
            } else {
                card.style.display = card.dataset.cat === filter ? '' : 'none';
            }
        });
    });
});

/* ── Setup Event Listeners Programmatically ── */
document.querySelectorAll('.api-card').forEach(card => {
    const tryBtn = card.querySelector('.api-btn-try');
    if (tryBtn) {
        tryBtn.addEventListener('click', () => {
            const panel = card.querySelector('.api-try-panel');
            const open = panel.classList.toggle('open');
            tryBtn.classList.toggle('open', open);
            tryBtn.innerHTML = open
                ? "<i class='bx bx-x'></i> Close"
                : "<i class='bx bx-play'></i> Try It";
        });
    }

    const runBtn = card.querySelector('.api-run-btn');
    if (runBtn) {
        if (card.querySelector('#gh-input')) {
            runBtn.addEventListener('click', runGithub);
        } else if (card.querySelector('#nasa-response')) {
            runBtn.addEventListener('click', runNasa);
        } else if (card.querySelector('#owm-city')) {
            runBtn.addEventListener('click', runWeather);
        } else if (card.querySelector('#news-topic')) {
            runBtn.addEventListener('click', runNews);
        } else if (card.querySelector('#oai-prompt')) {
            runBtn.addEventListener('click', runOpenAI);
        } else if (card.querySelector('#rc-input')) {
            runBtn.addEventListener('click', runCountry);
        }
    }
});

/* ── Helper: show response ── */
function showResponse(el, text, isError) {
    el.textContent = text;
    el.classList.add('visible');
    el.classList.toggle('error', isError);
    el.classList.remove('loading');
}

function showLoading(el) {
    el.textContent = 'Fetching response...';
    el.classList.add('visible', 'loading');
    el.classList.remove('error');
}

/* ── GitHub ── */
async function runGithub() {
    const username = document.getElementById('gh-input').value.trim() || 'torvalds';
    const el = document.getElementById('gh-response');
    showLoading(el);
    try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        const data = await res.json();
        if (data.message) throw new Error(data.message);
        showResponse(el,
            `Name:        ${data.name || 'N/A'}\n` +
            `Username:    ${data.login}\n` +
            `Bio:         ${data.bio || 'N/A'}\n` +
            `Public repos:${data.public_repos}\n` +
            `Followers:   ${data.followers}\n` +
            `Profile:     ${data.html_url}`
        );
    } catch (e) { showResponse(el, `Error: ${e.message}`, true); }
}

/* ── NASA APOD ── */
async function runNasa() {
    const el = document.getElementById('nasa-response');
    const btn = el.previousElementSibling.querySelector('.api-run-btn');
    showLoading(el);
    btn.disabled = true;
    try {
        const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
        const data = await res.json();
        showResponse(el,
            `Title:    ${data.title}\n` +
            `Date:     ${data.date}\n` +
            `Media:    ${data.media_type}\n` +
            `URL:      ${data.url}\n\n` +
            `Explanation:\n${data.explanation.substring(0, 200)}...`
        );
    } catch (e) { showResponse(el, `Error: ${e.message}`, true); }
    finally { btn.disabled = false; }
}

/* ── OpenWeatherMap ── */
async function runWeather() {
    const key = document.getElementById('owm-key').value.trim();
    const city = document.getElementById('owm-city').value.trim() || 'Manila';
    const el = document.getElementById('owm-response');
    if (!key) { showResponse(el, 'Please enter your OpenWeatherMap API key above.', true); return; }
    showLoading(el);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`);
        const data = await res.json();
        if (data.cod !== 200) throw new Error(data.message);
        showResponse(el,
            `City:        ${data.name}, ${data.sys.country}\n` +
            `Temperature: ${data.main.temp}°C (feels like ${data.main.feels_like}°C)\n` +
            `Condition:   ${data.weather[0].description}\n` +
            `Humidity:    ${data.main.humidity}%\n` +
            `Wind:        ${data.wind.speed} m/s`
        );
    } catch (e) { showResponse(el, `Error: ${e.message}`, true); }
}

/* ── NewsAPI ── */
async function runNews() {
    const key = document.getElementById('news-key').value.trim();
    const topic = document.getElementById('news-topic').value.trim() || 'technology';
    const el = document.getElementById('news-response');
    if (!key) { showResponse(el, 'Please enter your NewsAPI key above.', true); return; }
    showLoading(el);
    try {
        const res = await fetch(`https://newsapi.org/v2/everything?q=${topic}&apiKey=${key}&pageSize=3&language=en`);
        const data = await res.json();
        if (data.status !== 'ok') throw new Error(data.message);
        const lines = data.articles.map((a, i) =>
            `[${i + 1}] ${a.title}\n    Source: ${a.source.name}\n    ${a.url}\n`
        ).join('\n');
        showResponse(el, `Top 3 articles about "${topic}":\n\n${lines}`);
    } catch (e) { showResponse(el, `Error: ${e.message}`, true); }
}

/* ── OpenAI ── */
async function runOpenAI() {
    const key = document.getElementById('oai-key').value.trim();
    const prompt = document.getElementById('oai-prompt').value.trim() || 'Say hello in one sentence.';
    const el = document.getElementById('oai-response');
    if (!key) { showResponse(el, 'Please enter your OpenAI API key above.', true); return; }
    showLoading(el);
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 150 })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        showResponse(el,
            `Model:    ${data.model}\n` +
            `Tokens:   ${data.usage.total_tokens} used\n\n` +
            `Response:\n${data.choices[0].message.content}`
        );
    } catch (e) { showResponse(el, `Error: ${e.message}`, true); }
}

/* ── REST Countries ── */
async function runCountry() {
    const name = document.getElementById('rc-input').value.trim() || 'Philippines';
    const el = document.getElementById('rc-response');
    showLoading(el);
    try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error(data.message || 'Not found');
        const c = data[0];
        const currencies = Object.values(c.currencies || {}).map(x => x.name).join(', ');
        const languages = Object.values(c.languages || {}).join(', ');
        showResponse(el,
            `Country:    ${c.name.common} (${c.cca2})\n` +
            `Capital:    ${(c.capital || ['N/A'])[0]}\n` +
            `Region:     ${c.region} — ${c.subregion}\n` +
            `Population: ${c.population.toLocaleString()}\n` +
            `Currency:   ${currencies}\n` +
            `Languages:  ${languages}\n` +
            `Flag:       ${c.flag}`
        );
    } catch (e) { showResponse(el, `Error: ${e.message}`, true); }
}
