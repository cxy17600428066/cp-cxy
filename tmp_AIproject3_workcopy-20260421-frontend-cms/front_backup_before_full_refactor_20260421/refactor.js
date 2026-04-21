const fs = require('fs');
const files = ['index.html', 'about.html', 'contact.html', 'products.html', 'news.html'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // First, clean up previous script attempts (if zhuoxi-navbar exists, we already replaced it mostly but want to make sure it's clean)
    // If it's already exactly the tag, we don't need to replace. But to be safe, let's normalize everything back to the tag.
    
    // Replace old nav (with or without comments)
    if (content.includes('<nav class="navbar"')) {
        content = content.replace(/(?:<!-- ═══ Floating Navbar ═══ -->\s*)?<nav class="navbar"[\s\S]*?<\/nav>/, 
            '<!-- ═══ Floating Navbar ═══ -->\n    <zhuoxi-navbar></zhuoxi-navbar>\n    <script src="components/navbar.js"></script>');
    }
    
    // Replace old footer
    if (content.includes('<footer class="footer"')) {
        content = content.replace(/(?:<!-- ═══ Footer ═══ -->\s*)?<footer class="footer"[\s\S]*?<\/footer>/,
            '<!-- ═══ Footer ═══ -->\n    <zhuoxi-footer></zhuoxi-footer>\n    <script src="components/footer.js"></script>');
    }
        
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
});
