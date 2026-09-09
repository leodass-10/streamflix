const StreamAPI = (() => {
    const BASE = 'https://streamed.pk';
    
    // User requested only Football and F1 support
    const ALLOWED = ['football', 'f1', 'motorsport', 'motor-sports', 'formula 1'];
    
    // Internal cache
    const cache = new Map();
    const TTL = {
        sports: 3600000,    // 1 hour
        matches: 120000,    // 2 minutes
        streams: 300000,    // 5 minutes
    };
    
    async function fetchJSON(path) {
        const res = await fetch(`${BASE}${path}`);
        if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
        return res.json();
    }
    
    async function cachedFetch(key, path, ttl, isMatches = false, isSports = false) {
        const c = cache.get(key);
        if (c && Date.now() - c.t < ttl) return c.d;
        let d = await fetchJSON(path);
        
        // Apply Football & F1 filters
        if (isSports && Array.isArray(d)) {
            d = d.filter(s => ALLOWED.includes(s.id.toLowerCase()));
        } else if (isMatches && Array.isArray(d)) {
            d = d.filter(m => ALLOWED.includes(m.category.toLowerCase()));
        }
        
        cache.set(key, { d, t: Date.now() });
        return d;
    }
    
    return {
        // Sports
        getSports: () => cachedFetch('sports', '/api/sports', TTL.sports, false, true),
        
        // Matches - various endpoints
        getAllMatches: () => cachedFetch('all', '/api/matches/all', TTL.matches, true),
        getLiveMatches: () => cachedFetch('live', '/api/matches/live', TTL.matches, true),
        getTodayMatches: () => cachedFetch('today', '/api/matches/all-today', TTL.matches, true),
        getPopularMatches: () => cachedFetch('popular', '/api/matches/all/popular', TTL.matches, true),
        getTodayPopular: () => cachedFetch('today-pop', '/api/matches/all-today/popular', TTL.matches, true),
        getLivePopular: () => cachedFetch('live-pop', '/api/matches/live/popular', TTL.matches, true),
        getSportMatches: (sport) => cachedFetch(`sport-${sport}`, `/api/matches/${sport}`, TTL.matches, true),
        getSportPopular: (sport) => cachedFetch(`sport-pop-${sport}`, `/api/matches/${sport}/popular`, TTL.matches, true),
        
        // Streams
        getStreams: (source, id) => cachedFetch(`stream-${source}-${id}`, `/api/stream/${source}/${id}`, TTL.streams),
        
        // Images (return URL strings)
        getBadgeUrl: (id) => `${BASE}/api/images/badge/${id}.webp`,
        getPosterUrl: (b1, b2) => `${BASE}/api/images/poster/${b1}/${b2}.webp`,
        getProxyUrl: (poster) => `${BASE}/api/images/proxy/${poster}.webp`,
        
        // Image helper - waterfall logic
        getMatchImage: (match) => {
            if (match.teams?.home?.badge && match.teams?.away?.badge)
                return `${BASE}/api/images/poster/${match.teams.home.badge}/${match.teams.away.badge}.webp`;
            if (match.poster)
                return `${BASE}/api/images/proxy/${match.poster}.webp`;
            if (match.teams?.home?.badge)
                return `${BASE}/api/images/badge/${match.teams.home.badge}.webp`;
            return null;
        },
        
        // Clear cache
        clearCache: () => cache.clear(),
        
        // Find match by ID in a list
        findMatch: (matches, id) => matches.find(m => m.id === id),
    };
})();
