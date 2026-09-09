const fs = require('fs');

let code = fs.readFileSync('D:/APPU/CODE/WEB/streamflix/js/components.js', 'utf8');

// NAVBAR mapping
code = code.replace(/navbar-left/g, 'nav-left');
code = code.replace(/navbar-right/g, 'nav-right');
code = code.replace(/class="logo"/g, 'class="nav-logo"');
code = code.replace(/nav-tabs/g, 'nav-links');
code = code.replace(/mobile-hamburger/g, 'nav-mobile-toggle');
code = code.replace(/avatar-circle/g, 'nav-avatar');
code = code.replace(/class="avatar"/g, 'class=""'); // avatar div not needed or we just keep it

// HERO mapping
code = code.replace(/hero-container/g, 'hero');
code = code.replace(/hero-slide/g, 'hero');
code = code.replace(/hero-gradient/g, 'hero-backdrop');
code = code.replace(/btn-play/g, 'btn-primary');
code = code.replace(/btn-info/g, 'btn-secondary');

// CARD ROW mapping
code = code.replace(/card-row-section/g, 'section');
code = code.replace(/row-title/g, 'section-title');
code = code.replace(/row-container/g, 'card-row-wrapper');
code = code.replace(/row-nav left-nav/g, 'card-row-arrow left');
code = code.replace(/row-nav right-nav/g, 'card-row-arrow right');

// CARD mapping
code = code.replace(/match-card/g, 'card');
code = code.replace(/card-img-container/g, 'card-img-wrapper');
code = code.replace(/action-btn/g, 'card-btn');

fs.writeFileSync('D:/APPU/CODE/WEB/streamflix/js/components.js', code);
console.log('UI classes patched in components.js');
