(() => {
    const backScript = document.currentScript;
    const homePath = backScript.dataset.home;
    const backLink = document.createElement('a');

    backLink.className = 'zone-back-link';
    backLink.href = new URL(homePath, document.baseURI).href;
    backLink.textContent = '← Longmore Zone';
    backLink.setAttribute('aria-label', 'Back to Longmore Zone game directory');

    const backStyles = document.createElement('style');
    backStyles.textContent = `
        .zone-back-link {
            position: fixed;
            z-index: 2147483647;
            top: max(12px, env(safe-area-inset-top));
            left: max(12px, env(safe-area-inset-left));
            display: inline-flex;
            min-height: 44px;
            align-items: center;
            padding: 0 15px;
            border: 1px solid #ffffff50;
            border-radius: 999px;
            background: #172a3ce8;
            color: #fff;
            box-shadow: 0 2px 10px #0005;
            font: 600 14px/1 system-ui, sans-serif;
            text-decoration: none;
            touch-action: manipulation;
        }

        .zone-back-link:hover { background: #244e75; }

        .zone-back-link:focus-visible {
            outline: 3px solid #f3a45d;
            outline-offset: 3px;
        }
    `;

    document.head.append(backStyles);
    document.body.prepend(backLink);
})();
