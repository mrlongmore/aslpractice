const updates = [
    {
        date: 'Oct 29, 2026',
        title: 'A new way to explore',
        description: 'Search the directory or filter by FOOD, INTERACTIVE, VOCAB, PUZZLE, and other topic tags.'
    }
];

const updatesList = document.querySelector('#updates-list');

updates.forEach((update) => {
    const article = document.createElement('article');
    article.className = 'update-card';
    const date = document.createElement('p');
    date.className = 'update-date';
    date.textContent = update.date;
    const title = document.createElement('h2');
    title.textContent = update.title;
    const description = document.createElement('p');
    description.textContent = update.description;
    article.append(date, title, description);
    updatesList.append(article);
});
