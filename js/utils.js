const Utils = (() => {
    // Time formatting
    function formatMatchTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = timestamp - now.getTime();
        
        // If live (started within last 3 hours)
        if (diff <= 0 && diff > -3 * 3600000) return 'LIVE';
        
        // If today
        if (date.toDateString() === now.toDateString()) {
            return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // Tomorrow
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatDate(timestamp) {
        return formatMatchTime(timestamp);
    }

    function formatDateShort(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function getCountdown(timestamp) {
        const diff = timestamp - Date.now();
        if (diff <= 0) return null;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        if (h > 24) return `${Math.floor(h/24)}d ${h%24}h`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }
    
    function isLive(match) {
        const diff = Date.now() - match.date;
        return diff >= 0 && diff < 4 * 3600000; // within 4 hours of start
    }
    
    function isUpcoming(match) {
        return match.date > Date.now();
    }
    
    // Debounce
    function debounce(fn, ms) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    }
    
    // Throttle
    function throttle(fn, ms) {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= ms) {
                last = now;
                fn(...args);
            }
        };
    }
    
    // Simple fuzzy search
    function fuzzyMatch(query, text) {
        query = query.toLowerCase();
        text = text.toLowerCase();
        if (text.includes(query)) return true;
        // Check each word
        const words = query.split(/\s+/);
        return words.every(w => text.includes(w));
    }
    
    // Search matches
    function searchMatches(matches, query) {
        if (!query || query.length < 2) return [];
        return matches.filter(m => {
            const searchable = [
                m.title,
                m.category,
                m.teams?.home?.name || '',
                m.teams?.away?.name || '',
            ].join(' ');
            return fuzzyMatch(query, searchable);
        });
    }
    
    // Sport emoji map
    const sportIcons = {
        football: '⚽', basketball: '🏀', tennis: '🎾',
        hockey: '🏒', baseball: '⚾', mma: '🥊',
        boxing: '🥊', cricket: '🏏', rugby: '🏉',
        'american-football': '🏈', motorsport: '🏎️', 'motor-sports': '🏎️',
        f1: '🏎️', golf: '⛳', fighting: '🥊', default: '🏆'
    };
    
    function getSportIcon(sportId) {
        return sportIcons[sportId.toLowerCase()] || sportIcons.default;
    }
    
    // Generate gradient for fallback card backgrounds
    const gradients = [
        ['#1a237e', '#0d47a1'], ['#b71c1c', '#880e4f'],
        ['#004d40', '#1b5e20'], ['#4a148c', '#311b92'],
        ['#e65100', '#bf360c'], ['#1b5e20', '#004d40'],
        ['#0d47a1', '#1a237e'], ['#f57f17', '#e65100'],
    ];
    
    function getGradient(str) {
        let hash = 0;
        for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return gradients[Math.abs(hash) % gradients.length];
    }
    
    // Group matches by category
    function groupByCategory(matches) {
        const groups = {};
        matches.forEach(m => {
            if (!groups[m.category]) groups[m.category] = [];
            groups[m.category].push(m);
        });
        return groups;
    }
    
    return {
        formatMatchTime, formatDate, formatDateShort, getCountdown, isLive, isUpcoming,
        debounce, throttle, fuzzyMatch, searchMatches,
        getSportIcon, getGradient, groupByCategory,
    };
})();
