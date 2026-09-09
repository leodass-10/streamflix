const AppState = (() => {
    const state = {
        sports: [],
        liveMatches: [],
        allMatches: [],
        todayPopular: [],
        selectedMatch: null,
        selectedStreams: [],
        activeStreamUrl: '',
        activeSource: null,
        searchQuery: '',
        searchResults: [],
        isLoading: true,
        currentPage: 'home',
        myList: JSON.parse(localStorage.getItem('streamflix-mylist') || '[]'),
    };
    
    const listeners = new Map();
    
    function get(key) { return state[key]; }
    
    function set(key, value) {
        const old = state[key];
        state[key] = value;
        if (key === 'myList') {
            localStorage.setItem('streamflix-mylist', JSON.stringify(value));
        }
        (listeners.get(key) || []).forEach(fn => fn(value, old));
        (listeners.get('*') || []).forEach(fn => fn(key, value, old));
    }
    
    function on(key, fn) {
        if (!listeners.has(key)) listeners.set(key, []);
        listeners.get(key).push(fn);
        return () => {
            const arr = listeners.get(key);
            const idx = arr.indexOf(fn);
            if (idx > -1) arr.splice(idx, 1);
        };
    }
    
    function toggleMyList(matchId) {
        const list = [...state.myList];
        const idx = list.indexOf(matchId);
        if (idx > -1) list.splice(idx, 1);
        else list.push(matchId);
        set('myList', list);
    }
    
    function isInMyList(matchId) {
        return state.myList.includes(matchId);
    }
    
    return { get, set, on, toggleMyList, isInMyList };
})();
