/**
 * Javascript: Unified Portal Help System (Manual)
 * Dynamic tab switching, search, and keyword highlighting.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements Query
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.manual-section');
    const searchInput = document.getElementById('help-search-input');
    const searchClearBtn = document.getElementById('help-search-clear');

    // 2. Tab Navigation Switching
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            switchSection(targetId);
        });
    });

    function switchSection(targetId) {
        // Switch active states in Sidebar
        menuItems.forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Switch active states in Content Viewport
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active-section');
            } else {
                section.classList.remove('active-section');
            }
        });

        // Reset scroll position to top
        document.querySelector('.help-content-viewport').scrollTop = 0;
    }

    // 3. Realtime Keyword Highlighting & Auto Tab Switching
    let originalContentsMap = new Map();

    // Cache original HTML content to restore safely
    sections.forEach(section => {
        originalContentsMap.set(section.id, section.innerHTML);
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();

        if (query === '') {
            restoreOriginalContents();
            searchClearBtn.style.display = 'none';
            return;
        }

        searchClearBtn.style.display = 'flex';
        performLiveSearch(query);
    });

    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        restoreOriginalContents();
        searchClearBtn.style.display = 'none';
        searchInput.focus();
    });

    function restoreOriginalContents() {
        sections.forEach(section => {
            section.innerHTML = originalContentsMap.get(section.id);
        });
    }

    function performLiveSearch(keyword) {
        // First restore to clear previous highlights
        restoreOriginalContents();

        let matchedSectionId = null;
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedKeyword = escapeRegExp(keyword);
        const regex = new RegExp(`(${escapedKeyword})`, 'gi');

        sections.forEach(section => {
            let sectionContainsKeyword = false;

            // Deep text nodes highlight function
            const highlightTextNodes = (element) => {
                if (element.nodeType === Node.TEXT_NODE) {
                    const originalText = element.nodeValue;
                    if (originalText && regex.test(originalText)) {
                        sectionContainsKeyword = true;
                        
                        // Create a temporary element to safely parse span replacements
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = originalText.replace(regex, '<span class="help-highlight">$1</span>');
                        
                        // Replace the text node with parsed HTML child elements
                        while (tempDiv.firstChild) {
                            element.parentNode.insertBefore(tempDiv.firstChild, element);
                        }
                        element.parentNode.removeChild(element);
                    }
                } else if (element.nodeType === Node.ELEMENT_NODE && element.nodeName !== 'SCRIPT' && element.nodeName !== 'STYLE') {
                    // Convert children array because we mutate nodes in place
                    const children = Array.from(element.childNodes);
                    children.forEach(child => highlightTextNodes(child));
                }
            };

            // Recursively highlight matching text
            highlightTextNodes(section);

            // Keep track of the first section containing the keyword
            if (sectionContainsKeyword && !matchedSectionId) {
                matchedSectionId = section.id;
            }
        });

        // Auto-switch to the first matching section to elevate usability!
        if (matchedSectionId) {
            switchSection(matchedSectionId);
        }
    }
});
