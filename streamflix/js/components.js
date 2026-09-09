const Components = (() => {

    function renderNavbar(sports) {
        let tabsHtml = sports.slice(0, 6).map(s => 
            `<a href="#/sport/${s.id}" class="nav-tab" data-sport="${s.id}">${s.name}</a>`
        ).join('');

        return `
            <div id="navbar" class="navbar">
                <div class="nav-left">
                    <a href="#/" class="nav-logo">STREAMFLIX</a>
                    <div class="nav-links desktop-only">
                        ${tabsHtml}
                    </div>
                </div>
                <div class="nav-right">
                    <button id="search-trigger" class="btn-icon" aria-label="Search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                    <button id="mobile-toggle" class="btn-icon nav-mobile-toggle" aria-label="Menu" style="display: none;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <div id="mobile-menu" class="mobile-menu" style="display: none; position: fixed; top: 68px; left: 0; right: 0; background: var(--black); z-index: 999; padding: var(--space-md); flex-direction: column; gap: var(--space-md);">
                <a href="#/" class="nav-tab">Home</a>
                ${sports.map(s => `<a href="#/sport/${s.id}" class="nav-tab" data-sport="${s.id}">${s.name}</a>`).join('')}
            </div>
        `;
    }

    function renderHero(matches) {
        if (!matches || matches.length === 0) return '';
        
        const slidesHtml = matches.slice(0, 5).map((match, index) => {
            const activeClass = index === 0 ? 'active' : '';
            const bgImg = StreamAPI.getMatchImage(match) || '';
            const isLive = Utils.isLive(match);
            
            return `
                <div class="hero-slide ${activeClass}" data-index="${index}" style="display: ${index === 0 ? 'flex' : 'none'}; position: absolute; inset: 0; align-items: flex-end;">
                    <div class="hero-backdrop dot-grid" style="background-image: url('${bgImg}'), radial-gradient(circle, var(--border-visible) 1px, transparent 1px);"></div>
                    <div class="hero-content">
                        <h1 class="hero-title">${match.title}</h1>
                        <div class="hero-meta">
                            ${isLive ? `<span class="badge live">LIVE</span>` : ''}
                            <span class="badge">${match.category || 'Sport'}</span>
                            <span class="t-label">${Utils.formatMatchTime(match.date)}</span>
                            <span class="badge hd">HD</span>
                        </div>
                        <p class="hero-desc">Experience the thrill of live sports right here on StreamFlix. Catch every moment, every goal, and every finish.</p>
                        <div class="hero-actions">
                            <a href="#/watch/${match.id}" class="btn btn-primary">Watch Now</a>
                            <button class="btn btn-secondary card-btn-add" data-match-id="${match.id}">+ List</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const dotsHtml = matches.slice(0, 5).map((m, i) => 
            `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
        ).join('');

        return `
            <div class="hero" id="hero-billboard">
                ${slidesHtml}
                <div class="hero-dots">
                    ${dotsHtml}
                </div>
            </div>
        `;
    }

    function renderCard(match) {
        const imgUrl = StreamAPI.getMatchImage(match);
        const imgHtml = imgUrl 
            ? `<img class="card-img" src="${imgUrl}" alt="${match.title}" loading="lazy" onerror="this.src=''; this.style.background='var(--border)'">`
            : `<div class="card-img" style="background:var(--border)"></div>`;

        const isLive = Utils.isLive(match);
        const isUpcoming = Utils.isUpcoming(match);
        
        let badgesHtml = '';
        if (isLive) badgesHtml += `<span class="badge live" style="background:var(--black);">LIVE</span>`;
        else if (isUpcoming) badgesHtml += `<span class="badge" style="background:var(--black);">${Utils.getCountdown(match.date)||'SOON'}</span>`;

        return `
            <div class="card" data-match-id="${match.id}" onclick="window.location.hash = '/watch/${match.id}'">
                <div class="card-img-wrapper">
                    ${imgHtml}
                    <div class="card-badges">${badgesHtml}</div>
                </div>
                <div class="card-overlay">
                    <h3 class="card-title">${match.title}</h3>
                    <div class="card-meta">
                        <span>${match.category}</span>
                        <span>${Utils.formatDateShort(match.date)}</span>
                    </div>
                    <div class="card-actions">
                        <button class="card-btn" aria-label="Play" onclick="event.stopPropagation(); window.location.hash = '/watch/${match.id}'"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></button>
                        <button class="card-btn card-btn-add" aria-label="Add" onclick="event.stopPropagation();" data-match-id="${match.id}">+</button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderCardRow(title, matches) {
        if (matches === null || matches === undefined) {
            return `
                <div class="section">
                    <h2 class="section-title">${title}</h2>
                    ${renderSkeletonRow()}
                </div>
            `;
        }
        if (matches.length === 0) return '';

        return `
            <div class="section">
                <h2 class="section-title">${title}</h2>
                <div class="card-row-wrapper">
                    <button class="card-row-arrow left row-arrow-left"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                    <div class="card-row">
                        ${matches.map(m => renderCard(m)).join('')}
                    </div>
                    <button class="card-row-arrow right row-arrow-right"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                </div>
            </div>
        `;
    }

    function renderSkeletonRow() {
        const skeletons = Array(5).fill(0).map(() => `
            <div class="card" style="pointer-events: none;">
                <div class="card-img-wrapper"></div>
                <div class="card-overlay">
                    <div style="height: 16px; background: var(--border); width: 80%; margin-bottom: 8px;"></div>
                    <div style="height: 12px; background: var(--border); width: 40%;"></div>
                </div>
            </div>
        `).join('');
        return `
            <div class="card-row-wrapper">
                <div class="card-row skeleton-row">
                    ${skeletons}
                </div>
            </div>
        `;
    }

    function renderPlayer(embedUrl) {
        if (!embedUrl) return `<div style="aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; color: var(--text-secondary); font-family: var(--font-mono);">[ STREAM UNAVAILABLE ]</div>`;
        return `
            <div class="player-wrapper">
                <iframe id="stream-player" src="${embedUrl}" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen frameborder="0" scrolling="no"></iframe>
            </div>
        `;
    }

    function renderWatchPage(match, streams, activeSource) {
        if (!match) return renderError("Match not found", () => window.history.back());
        let defaultEmbedUrl = streams && streams.length > 0 ? streams[0].embedUrl : '';

        return `
            <div class="watch-page">
                <div class="player-container">
                    ${renderPlayer(defaultEmbedUrl)}
                </div>
                <div class="section container">
                    <h1 class="t-display-md" style="margin-bottom:var(--space-sm);">${match.title}</h1>
                    <div class="flex-gap-md" style="margin-bottom:var(--space-xl);">
                        <span class="t-label">${match.category}</span>
                        <span class="t-label">${Utils.formatMatchTime(match.date)}</span>
                        ${Utils.isLive(match) ? `<span class="badge live">LIVE</span>` : ''}
                    </div>
                    
                    <h3 class="t-heading" style="margin-bottom:var(--space-md);">SOURCES</h3>
                    <div id="source-pills-container" style="display:flex; gap:var(--space-sm); flex-wrap:wrap; margin-bottom:var(--space-xl);">
                        ${match.sources ? renderSourcePills(match.sources, activeSource) : ''}
                    </div>
                    
                    <h3 class="t-heading" style="margin-bottom:var(--space-md);">STREAMS</h3>
                    <div id="stream-list" class="stream-list">
                        ${streams ? renderStreamList(streams, defaultEmbedUrl) : '<p class="t-label">[ NO STREAMS AVAILABLE ]</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    function renderSourcePills(sources, activeSourceId) {
        if (!sources || sources.length === 0) return '';
        return sources.map(src => {
            const isActive = src.id === activeSourceId || (!activeSourceId && src === sources[0]);
            return `<button class="source-pill ${isActive ? 'btn-primary' : ''}" data-source-id="${src.id}" data-source="${src.source}">${src.source}</button>`;
        }).join('');
    }

    function renderStreamList(streams, activeStreamUrl) {
        if (!streams || streams.length === 0) return '<p class="t-label">[ NO STREAMS FOUND ]</p>';
        return streams.map((stream, i) => {
            const isActive = stream.embedUrl === activeStreamUrl;
            return `
                <div class="stream-item" data-embed-url="${stream.embedUrl}">
                    <div class="stream-info">
                        <strong class="stream-label">STREAM #${stream.streamNo || i + 1}</strong>
                        <span class="t-label">${stream.language || 'EN'}</span>
                        <span class="badge ${stream.hd ? 'hd' : ''}">${stream.hd ? 'HD' : 'SD'}</span>
                    </div>
                    <button class="btn ${isActive ? 'btn-primary' : 'btn-secondary'}">${isActive ? 'PLAYING' : 'WATCH'}</button>
                </div>
            `;
        }).join('');
    }

    function renderSportPage(sport, matches, filter = 'all') {
        const filters = [{ id: 'all', label: 'All' }, { id: 'popular', label: 'Popular' }, { id: 'live', label: 'Live' }];
        let filteredMatches = matches;
        if (filter === 'live') filteredMatches = matches.filter(m => Utils.isLive(m));

        const gridHtml = filteredMatches && filteredMatches.length > 0 
            ? filteredMatches.map(m => renderCard(m)).join('')
            : renderEmpty(`[ NO MATCHES FOUND FOR ${sport.name.toUpperCase()} ]`);

        return `
            <div class="section container" style="padding-top: 100px; min-height: 80vh;">
                <div class="flex-between" style="margin-bottom: var(--space-xl);">
                    <h1 class="t-display-md">${sport.name}</h1>
                    <div class="filter-tabs">
                        ${filters.map(f => `<button class="filter-tab ${filter === f.id ? 'btn-primary' : ''}" data-filter="${f.id}">${f.label}</button>`).join('')}
                    </div>
                </div>
                <div class="match-grid">
                    ${gridHtml}
                </div>
            </div>
        `;
    }

    function renderSearchOverlay() {
        return `
            <div id="search-overlay" class="search-overlay">
                <div class="search-input-wrapper">
                    <input type="text" id="search-input" class="search-input" placeholder="SEARCH...">
                    <button class="search-close btn-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
                <div class="container">
                    <div id="search-results" class="match-grid" style="margin-top: var(--space-xl);"></div>
                </div>
            </div>
        `;
    }

    function renderFooter() {
        return `
            <footer class="footer">
                <div class="footer-text">
                    [ STREAMFLIX © ${new Date().getFullYear()} ] — FOOTBALL & F1
                </div>
            </footer>
        `;
    }

    function renderPreloader() { return `<div id="preloader" style="position:fixed; inset:0; background:var(--black); z-index:9999; display:flex; align-items:center; justify-content:center;"><div class="t-display-lg" style="animation: preloader-pulse 1.5s infinite;">STREAMFLIX</div></div>`; }
    function renderNotifBar(msg) { return `<div style="position:fixed; bottom:var(--space-md); right:var(--space-md); background:var(--surface-raised); border: 1px solid var(--border-visible); color:var(--text-display); padding:12px 24px; border-radius:4px; z-index:9999; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;">[ ${msg} ]</div>`; }
    function renderError(msg, cb) { return `<div style="padding:100px 20px; text-align:center;"><h2 class="t-display-md" style="margin-bottom:var(--space-md);">ERROR</h2><p class="t-label" style="margin-bottom:var(--space-lg);">[ ${msg} ]</p>${cb ? `<button class="btn btn-primary" onclick="${cb}()">RETRY</button>` : ''}</div>`; }
    function renderEmpty(msg) { return `<div style="padding:100px 20px; text-align:center; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase;">${msg}</div>`; }

    return { renderNavbar, renderHero, renderCard, renderCardRow, renderSkeletonRow, renderPlayer, renderWatchPage, renderSourcePills, renderStreamList, renderSportPage, renderSearchOverlay, renderFooter, renderPreloader, renderNotifBar, renderError, renderEmpty };
})();
