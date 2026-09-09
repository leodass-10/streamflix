const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const App = (() => {
    let allMatches = [];
    let isInit = false;

    async function init() {
        if (isInit) return;
        try {
            const sports = await StreamAPI.getSports();
            AppState.set('sports', sports);
            
            // Build App Shell
            $('#app').innerHTML = 
                Components.renderNavbar(sports) +
                '<main id="main"></main>' +
                Components.renderFooter() +
                Components.renderSearchOverlay();
                
            wireNavbar();
            wireSearch();
            
            // Background fetch
            allMatches = await StreamAPI.getAllMatches();
            
            // Start router
            Router.start();
            
            setTimeout(() => {
                const preloader = $('#preloader');
                if (preloader) preloader.style.display = 'none';
            }, 500);
            isInit = true;
        } catch (e) {
            console.error(e);
            $('#app').innerHTML = Components.renderError('Failed to initialize app.', 'location.reload');
            const preloader = $('#preloader');
            if (preloader) preloader.style.display = 'none';
        }
    }

    // Wiring functions
    function wireNavbar() {
        const toggle = $('#mobile-toggle');
        const menu = $('#mobile-menu');
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
            });
        }
        
        window.addEventListener('scroll', () => {
            const nav = $('#navbar');
            if (nav) {
                if (window.scrollY > 20) nav.classList.add('scrolled');
                else nav.classList.remove('scrolled');
            }
        });
    }
    
    function wireSearch() {
        const trigger = $('#search-trigger');
        const overlay = $('#search-overlay');
        const close = overlay?.querySelector('.search-close');
        const input = $('#search-input');
        const results = $('#search-results');
        
        if (trigger && overlay) {
            trigger.addEventListener('click', () => {
                overlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
                input.focus();
            });
            close.addEventListener('click', () => {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
            input.addEventListener('input', Utils.debounce((e) => {
                const q = e.target.value;
                const matches = Utils.searchMatches(allMatches, q);
                results.innerHTML = matches.map(m => Components.renderCard(m)).join('');
            }, 300));
        }
    }

    function wireRowScrolls() {
        $$('.card-row-wrapper').forEach(wrapper => {
            const row = wrapper.querySelector('.card-row');
            const left = wrapper.querySelector('.row-arrow-left');
            const right = wrapper.querySelector('.row-arrow-right');
            if (!row) return;
            
            if (left) left.addEventListener('click', () => row.scrollBy({left: -row.offsetWidth + 100, behavior: 'smooth'}));
            if (right) right.addEventListener('click', () => row.scrollBy({left: row.offsetWidth - 100, behavior: 'smooth'}));
        });
    }

    // Pages
    async function showHome() {
        $('#main').innerHTML = Components.renderSkeletonRow();
        try {
            const live = await StreamAPI.getLiveMatches();
            const popular = await StreamAPI.getPopularMatches();
            
            let html = Components.renderHero(popular.slice(0, 5));
            html += Components.renderCardRow('Live Now', live);
            html += Components.renderCardRow('Popular', popular);
            
            $('#main').innerHTML = html;
            
            // Wire Hero Dots
            const slides = $$('.hero-slide');
            $$('.hero-dot').forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    $$('.hero-dot').forEach(d => d.classList.remove('active'));
                    slides.forEach(s => s.style.display = 'none');
                    dot.classList.add('active');
                    slides[i].style.display = 'flex';
                });
            });
            
            wireRowScrolls();
        } catch (e) {
            console.error(e);
            $('#main').innerHTML = Components.renderError('Failed to load home content.');
        }
    }

    async function showWatch(req) {
        $('#main').innerHTML = Components.renderSkeletonRow();
        const id = req.params.id;
        try {
            let matches = allMatches;
            if (!matches.length) matches = await StreamAPI.getAllMatches();
            const match = StreamAPI.findMatch(matches, id);
            if (!match) {
                $('#main').innerHTML = Components.renderError('Match not found.');
                return;
            }
            
            let sourceId = match.sources?.[0]?.id;
            let streams = [];
            if (sourceId) {
                streams = await StreamAPI.getStreams(match.sources[0].source, sourceId);
            }
            
            $('#main').innerHTML = Components.renderWatchPage(match, streams, sourceId);
            
            // Wire source pills
            $$('.source-pill').forEach(pill => {
                pill.addEventListener('click', async (e) => {
                    $$('.source-pill').forEach(p => p.classList.replace('btn-primary', 'btn-secondary'));
                    e.target.classList.replace('btn-secondary', 'btn-primary');
                    const newSourceId = e.target.getAttribute('data-source-id');
                    const newSource = e.target.getAttribute('data-source');
                    const newStreams = await StreamAPI.getStreams(newSource, newSourceId);
                    const defaultStreamUrl = newStreams.length ? newStreams[0].embedUrl : '';
                    
                    $('#stream-list').innerHTML = Components.renderStreamList(newStreams, defaultStreamUrl);
                    $('#stream-player').src = defaultStreamUrl || '';
                    wireStreamItems();
                });
            });
            
            wireStreamItems();
            
        } catch (e) {
            console.error(e);
            $('#main').innerHTML = Components.renderError('Failed to load match.');
        }
    }

    function wireStreamItems() {
        $$('.stream-item').forEach(item => {
            item.addEventListener('click', (e) => {
                $$('.stream-item').forEach(i => {
                    i.style.borderColor = 'transparent';
                    i.querySelector('button').classList.replace('btn-primary', 'btn-secondary');
                    i.querySelector('button').innerText = 'Watch';
                });
                item.style.borderColor = '#e50914';
                item.querySelector('button').classList.replace('btn-secondary', 'btn-primary');
                item.querySelector('button').innerText = 'Playing';
                
                $('#stream-player').src = item.getAttribute('data-embed-url');
            });
        });
    }

    async function showSport(req) {
        $('#main').innerHTML = Components.renderSkeletonRow();
        const id = req.params.id;
        try {
            const sports = AppState.get('sports');
            const sport = sports.find(s => s.id === id);
            const matches = await StreamAPI.getSportMatches(id);
            
            $('#main').innerHTML = Components.renderSportPage(sport, matches);
            
            $$('.filter-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    $$('.filter-tab').forEach(t => t.classList.replace('btn-primary', 'btn-secondary'));
                    e.target.classList.replace('btn-secondary', 'btn-primary');
                    const filter = e.target.getAttribute('data-filter');
                    
                    // Re-render sport page with filter
                    $('#main').innerHTML = Components.renderSportPage(sport, matches, filter);
                    // re-wire filter tabs
                    wireSportFilters(sport, matches);
                });
            });
        } catch (e) {
            console.error(e);
            $('#main').innerHTML = Components.renderError('Failed to load sport.');
        }
    }
    
    function wireSportFilters(sport, matches) {
        $$('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                $('#main').innerHTML = Components.renderSportPage(sport, matches, filter);
                wireSportFilters(sport, matches);
            });
        });
    }

    // Routes
    Router.on('/', showHome);
    Router.on('/watch/:id', showWatch);
    Router.on('/sport/:id', showSport);

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
