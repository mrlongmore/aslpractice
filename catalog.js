const games = [
    { title: 'ASL Bistro', description: 'Practice food signs as you build and serve orders in a 3D kitchen.', url: 'longmore_zone_games/aslkitchen.html', image: 'game_thumbnails/aslkitchen.png', icon: '🍳', tags: ['FOOD', 'INTERACTIVE', '3D'] },
    { title: 'Short Order', description: 'Watch signed food orders, then build each order from the menu.', url: 'longmore_zone_games/food_shorts_game.html', image: 'game_thumbnails/food_shorts_game.png', icon: '🥪', tags: ['FOOD', 'QUIZ'] },
    { title: 'ASL Table Service', description: 'Practice food signs while serving restaurant customers.', url: 'longmore_zone_games/asltable.html', image: 'game_thumbnails/asl_table_service.png', icon: '🍽️', tags: ['FOOD'] },
    { title: 'ASL Garden', description: 'Plant food-themed crops while practicing their signs.', url: 'longmore_zone_games/asl_garden.html', image: 'game_thumbnails/asl_garden.png', icon: '🌱', tags: ['FOOD', '3D'] },
    { title: 'ASL Warehouse', description: 'Practice signs while steering a forklift and completing warehouse goals.', url: 'longmore_zone_games/aslwarehouse.html', image: 'game_thumbnails/asl_warehouse.png', icon: '📦', tags: ['INTERACTIVE', '3D', 'ARCADE'] },
    { title: 'Horse Racer', description: 'Practice vocabulary, train your horse, and compete in races.', url: 'longmore_zone_games/horse_racer.html', image: 'game_thumbnails/horse_racer.png', icon: '🐎', tags: ['INTERACTIVE', 'QUIZ'] },
    { title: 'ASL Grand Prix', description: 'Take a quiz and race through an ASL-themed Grand Prix.', url: 'longmore_zone_games/asl_grand_prix.html', image: 'game_thumbnails/asl_grand_prix.png', icon: '🏎️', tags: ['QUIZ', 'ARCADE', '3D'] },
    { title: 'Vertical Rush', description: 'Race upward while practicing vocabulary in a platform game.', url: 'longmore_zone_games/vertical_rush.html', icon: '🚀', tags: ['ARCADE', 'QUIZ', '3D'] },
    { title: 'Jumper Quiz Challenge', description: 'Jump into a vocabulary quiz challenge.', url: 'longmore_zone_games/jump_man.html', image: 'game_thumbnails/jump_man.png', icon: '🦘', tags: ['ARCADE', 'QUIZ'] },
    { title: 'Subway Signer', description: 'Practice signing in an endless-runner game.', url: 'longmore_zone_games/subway_signer.html', image: 'game_thumbnails/subway_signer.png', icon: '🚇', tags: ['ARCADE', '3D'] },
    { title: 'City Dispatch', description: 'Navigate a city grid in this dispatch-themed runner.', url: 'longmore_zone_games/car_gps.html', icon: '🚕', tags: ['ARCADE'] },
    { title: 'Crazy Uber', description: 'Drive and answer ASL questions in a ride-share adventure.', url: 'longmore_zone_games/crazy_uber.html', icon: '🚘', tags: ['QUIZ', 'ARCADE'] },
    { title: 'Soccer Car', description: 'Take a car into an action-packed soccer challenge.', url: 'longmore_zone_games/soccercar.html', icon: '⚽', tags: ['ARCADE', '3D'] },
    { title: 'It Moves', description: 'Find your way through a 3D labyrinth and practice ASL.', url: 'longmore_zone_games/it_moves.html', icon: '🔦', tags: ['QUIZ', 'PUZZLE', '3D'] },
    { title: 'Snake GIF Challenge', description: 'Play Snake and identify the signs shown along the way.', url: 'longmore_zone_games/snake_game.html', icon: '🐍', tags: ['ARCADE', 'QUIZ'] },
    { title: 'Ultimate Crab Trainer', description: 'Jump into a 3D training challenge.', url: 'longmore_zone_games/ultimate_crab_trainer.html', icon: '🦀', tags: ['ARCADE', '3D'] },
    { title: 'ASL Buddy', description: 'Collect coins to buy items in an interactive 3D world.', url: 'longmore_zone_games/asl_buddy.html', icon: '🧑‍🚀', tags: ['INTERACTIVE', '3D'] },
    { title: 'Coin Creatures', description: 'Meet coin-themed creatures in this interactive game.', url: 'longmore_zone_games/coin_creatures.html', icon: '🪙', tags: ['INTERACTIVE'] },
    { title: 'ASL Vocab Sorting', description: 'Sort vocabulary into the right groups.', url: 'longmore_zone_games/crates.html', icon: '🗂️', tags: ['VOCAB', 'PUZZLE'] },
    { title: 'ASL Word Search', description: 'Find vocabulary by selecting words in the letter grid.', url: 'longmore_zone_games/asl_word_search.html', icon: '🔎', tags: ['VOCAB', 'WORD SEARCH', 'PUZZLE'] },
    { title: 'ASL Word Builder', description: 'Build vocabulary words in this word puzzle.', url: 'longmore_zone_games/asl_word_unscramble.html', icon: '🔤', tags: ['VOCAB', 'PUZZLE'] },
    { title: 'Fingerspelling Challenge', description: 'Watch a word signed and type what you see.', url: 'longmore_zone_games/fingerspelling_tool.html', icon: '🤟', tags: ['FINGERSPELLING', 'QUIZ'] },
    { title: 'ASL Anchor', description: 'Choose vocabulary topics, take a quiz, and see your results.', url: 'asl_anchor.html', icon: '⚓', tags: ['VOCAB', 'QUIZ'] },
    { title: 'Money Game', description: 'Practice money skills with an interactive register.', url: 'money_register/money_register.html', icon: '💵', tags: ['INTERACTIVE', 'PRACTICE'], type: 'tool' },
    { title: 'Eyebrow Grammar Challenge', description: 'Practice the role of eyebrows in ASL grammar.', url: 'eyebrows.html', icon: '👀', tags: ['GRAMMAR', 'PRACTICE'], type: 'tool' },
    { title: 'Video Practice', description: 'Practice with the ASL video collection.', url: 'videos/videos.html', icon: '🎬', tags: ['PRACTICE'], type: 'tool' }
];

const gameList = document.querySelector('#game-list');
const searchInput = document.querySelector('#game-search');
const typeFilters = document.querySelector('#type-filters');
const tagFilters = document.querySelector('#tag-filters');
const resultCount = document.querySelector('#results-count');
const collectionCount = document.querySelector('#collection-count');
const emptyState = document.querySelector('#empty-state');
const heroSignImage = document.querySelector('#hero-sign-image');
const heroSignCaption = document.querySelector('#hero-sign-caption');
let selectedType = 'all';
let selectedTag = 'all';

function makeButton(label, value, selected, group, onSelect, className) {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.textContent = label;
    button.dataset.value = value;
    button.setAttribute('aria-pressed', String(selected === value));
    button.addEventListener('click', () => onSelect(value));
    group.append(button);
    return button;
}

function updateButtonStates(group, selected) {
    group.querySelectorAll('button').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.value === selected));
    });
}

function renderTagFilters() {
    tagFilters.replaceChildren();
    const tags = [...new Set(games.flatMap((game) => game.tags))].sort();
    makeButton('ALL TAGS', 'all', selectedTag, tagFilters, (tag) => {
        selectedTag = tag;
        updateButtonStates(tagFilters, selectedTag);
        render();
    }, 'tag-button');
    tags.forEach((tag) =>
        makeButton(tag, tag, selectedTag, tagFilters, (selected) => {
            selectedTag = selected;
            updateButtonStates(tagFilters, selectedTag);
            render();
        }, 'tag-button')
    );
}

function renderTypeFilters() {
    typeFilters.replaceChildren();
    const types = [
        { label: 'Everything', value: 'all' },
        { label: 'Games', value: 'game' },
        { label: 'Practice tools', value: 'tool' }
    ];
    types.forEach(({ label, value }) =>
        makeButton(label, value, selectedType, typeFilters, (type) => {
            selectedType = type;
            updateButtonStates(typeFilters, selectedType);
            render();
        }, 'filter-button')
    );
}

async function loadRandomHeroSign() {
    try {
        const response = await fetch('vocab.json');
        if (!response.ok) {
            throw new Error(`Vocabulary request failed with status ${response.status}`);
        }

        const vocabulary = await response.json();
        const signs = Object.values(vocabulary).flatMap((topic) =>
            (topic.questions || [])
                .filter((question) => typeof question.image === 'string' && question.image.trim())
                .map((question) => ({
                    image: question.image,
                    answer: question.options?.[question.correct],
                    topic: topic.title
                }))
        );
        if (signs.length === 0) {
            throw new Error('No vocabulary sign images were found in vocab.json');
        }

        const sign = signs[Math.floor(Math.random() * signs.length)];
        const label = typeof sign.answer === 'string' ? sign.answer : sign.topic || 'ASL vocabulary';
        heroSignImage.alt = `ASL sign for ${label}`;
        heroSignCaption.textContent = `Signing: ${label}`;
        heroSignImage.addEventListener('load', () => {
            heroSignImage.hidden = false;
        }, { once: true });
        heroSignImage.addEventListener('error', () => {
            console.error(`Unable to load vocabulary sign image: ${sign.image}`);
        }, { once: true });
        heroSignImage.src = sign.image;
    } catch (error) {
        console.error('Unable to load a random vocabulary sign for the homepage:', error);
    }
}

function renderCards() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const filteredGames = games.filter((game) => {
        const matchesType = selectedType === 'all' || (game.type || 'game') === selectedType;
        const matchesTag = selectedTag === 'all' || game.tags.includes(selectedTag);
        const matchesQuery = `${game.title} ${game.description} ${game.tags.join(' ')}`.toLocaleLowerCase().includes(query);
        return matchesType && matchesTag && matchesQuery;
    });

    gameList.replaceChildren();
    filteredGames.forEach((game) => {
        const link = document.createElement('a');
        link.className = 'game-card';
        link.href = game.url;
        const art = document.createElement('div');
        art.className = 'card-art';
        const placeholder = document.createElement('span');
        placeholder.className = 'card-art-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');
        placeholder.textContent = game.icon;
        art.append(placeholder);
        if (game.image) {
            const image = document.createElement('img');
            image.alt = '';
            image.loading = 'lazy';
            image.decoding = 'async';
            image.addEventListener('load', () => {
                art.classList.add('has-image');
            }, { once: true });
            image.addEventListener('error', () => {
                console.error(`Unable to load image for ${game.title}: ${game.image}`);
            }, { once: true });
            image.src = game.image;
            art.append(image);
        }

        const top = document.createElement('div');
        top.className = 'card-top';
        const type = document.createElement('span');
        type.className = 'card-type';
        type.textContent = game.type === 'tool' ? 'Practice tool' : 'Game';
        top.append(type);

        const title = document.createElement('h4');
        title.textContent = game.title;
        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = game.description;
        const bottom = document.createElement('div');
        bottom.className = 'card-bottom';
        const tags = document.createElement('div');
        tags.className = 'card-tags';
        game.tags.forEach((tag) => {
            const badge = document.createElement('span');
            badge.className = 'card-tag';
            if (tag === 'FOOD') badge.classList.add('food');
            if (tag === 'INTERACTIVE') badge.classList.add('interactive');
            badge.textContent = tag;
            tags.append(badge);
        });
        const arrow = document.createElement('span');
        arrow.className = 'card-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';
        bottom.append(tags, arrow);
        link.append(art, top, title, description, bottom);
        gameList.append(link);
    });

    const noun = filteredGames.length === 1 ? 'result' : 'results';
    resultCount.textContent = `${filteredGames.length} ${noun}`;
    emptyState.hidden = filteredGames.length > 0;
}

function render() {
    renderCards();
}

collectionCount.textContent = `${games.filter((game) => !game.type || game.type === 'game').length} games · ${games.filter((game) => game.type === 'tool').length} tools`;
renderTypeFilters();
renderTagFilters();
render();
loadRandomHeroSign();
searchInput.addEventListener('input', render);
window.addEventListener('pageshow', (event) => {
    if (event.persisted) loadRandomHeroSign();
});

document.querySelector('.site-nav').addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    document.querySelectorAll('.site-nav a').forEach((navLink) => {
        navLink.classList.remove('active');
        navLink.removeAttribute('aria-current');
    });
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');

    if (link.classList.contains('nav-search')) {
        event.preventDefault();
        searchInput.focus();
        return;
    }

});

document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInput.focus();
    }
    if (event.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        render();
        searchInput.blur();
    }
});
