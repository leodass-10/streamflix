const Router = (() => {
    const routes = [];
    let currentRoute = null;
    
    function parseHash(hash) {
        hash = hash || '#/';
        if (!hash.startsWith('#')) hash = '#' + hash;
        const [path, queryString] = hash.slice(1).split('?');
        const query = {};
        if (queryString) {
            queryString.split('&').forEach(p => {
                const [k, v] = p.split('=');
                query[decodeURIComponent(k)] = decodeURIComponent(v || '');
            });
        }
        return { path: path || '/', query };
    }
    
    function matchRoute(pattern, path) {
        // pattern like '/sport/:id' matches '/sport/football'
        // returns { id: 'football' } or null
        const patternParts = pattern.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        if (patternParts.length !== pathParts.length) return null;
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    }
    
    function resolve() {
        const { path, query } = parseHash(window.location.hash);
        for (const route of routes) {
            const params = matchRoute(route.pattern, path);
            if (params !== null) {
                currentRoute = { pattern: route.pattern, path, params, query };
                route.handler({ params, query, path });
                window.scrollTo({ top: 0, behavior: 'auto' });
                return;
            }
        }
        // 404 fallback - navigate to home
        if (path !== '/') Router.navigate('#/');
    }
    
    return {
        on(pattern, handler) { routes.push({ pattern, handler }); return this; },
        navigate(hash) { window.location.hash = hash; },
        start() {
            window.addEventListener('hashchange', resolve);
            resolve(); // initial route
        },
        getCurrentRoute() { return currentRoute; },
    };
})();
