// Load common components
function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(html => {
            document.getElementById(elementId).innerHTML = html;
        })
        .catch(error => console.error('Error loading component:', error));
}

// Load navbar and footer on page load
document.addEventListener('DOMContentLoaded', function() {
    loadComponent('navbar-placeholder', 'navbar.html');
    loadComponent('footer-placeholder', 'footer.html');
    
    // Initialize capabilities carousel
    initCapabilitiesCarousel();
});

// Capabilities Carousel functionality
function initCapabilitiesCarousel() {
    const carousel = document.getElementById('cap-cards');
    const prevBtn = document.getElementById('cap-prev');
    const nextBtn = document.getElementById('cap-next');
    
    if (!carousel || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;
    const cardWidth = 370; // card width + gap
    const visibleCards = 3;
    const totalCards = carousel.children.length;
    const maxIndex = Math.max(0, totalCards - visibleCards);
    
    function updateCarousel() {
        const translateX = -currentIndex * cardWidth;
        carousel.style.transform = `translateX(${translateX}px)`;
    }
    
    nextBtn.addEventListener('click', function() {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });
    
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

/* Calculator logic */
document.addEventListener('DOMContentLoaded', function () {
    const baselineFactor = 0.00015; // kg CO2e per gram -> 20g * 0.00015 = 0.003 kg per pc

    function parseFactorFromOption(option) {
        return option ? parseFloat(option.getAttribute('data-factor') || 0) : 0;
    }

    function computeGHG(weightG, factor) {
        if (!weightG || !factor) return 0;
        return (weightG * factor); // kg CO2e per piece
    }

    function recalcColumn(col) {
        const weightEl = document.querySelector('.weight-input[data-col="' + col + '"]');
        const ghgEl = document.querySelector('.ghg-value[data-col="' + col + '"]');
        const savingsEl = document.querySelector('.savings-value[data-col="' + col + '"]');
        const totalSpan = document.getElementById('total-' + col);

        let weight = weightEl ? parseFloat(weightEl.value) : 0;
        if (isNaN(weight)) weight = 0;

        let factor = 0;
        // baseline column 0 is fixed
        if (col == 0) {
            factor = baselineFactor;
        } else {
            const sel = document.querySelector('.material-select[data-col="' + col + '"]');
            if (sel) factor = parseFactorFromOption(sel.options[sel.selectedIndex]);
        }

        const ghgPerPc = computeGHG(weight, factor);
        ghgEl.textContent = ghgPerPc ? ghgPerPc.toFixed(3) : 'Make a selection first';

        // compute savings relative to baseline
        const baselineWeightEl = document.querySelector('.weight-input[data-col="0"]');
        const baselineWeight = baselineWeightEl ? parseFloat(baselineWeightEl.value) : 0;
        const baselinePerPc = computeGHG(baselineWeight, baselineFactor);

        if (ghgPerPc && baselinePerPc) {
            const savings = baselinePerPc - ghgPerPc;
            const savingsText = (savings > 0) ? savings.toFixed(3) + ' kg' : (savings < 0 ? ('+' + Math.abs(savings).toFixed(3) + ' kg') : '0.000 kg');
            savingsEl.textContent = savingsText;
        } else {
            savingsEl.textContent = 'Make a selection first';
        }

        // total emissions
        const totalVolume = parseFloat(document.getElementById('total-volume').value) || 0;
        const totalEm = ghgPerPc * totalVolume;
        if (totalSpan) totalSpan.textContent = totalEm ? totalEm.toFixed(3) : '0.000';
    }

    // wire up events
    document.querySelectorAll('.weight-input').forEach(el => el.addEventListener('input', function () {
        const col = this.getAttribute('data-col');
        recalcColumn(col);
    }));

    document.querySelectorAll('.material-select').forEach(sel => sel.addEventListener('change', function () {
        const col = this.getAttribute('data-col');
        // when material selected, if corresponding weight empty, set placeholder or keep empty
        recalcColumn(col);
    }));

    document.getElementById('total-volume').addEventListener('input', function () {
        // recalc all columns totals
        [0,1,2].forEach(c => recalcColumn(c));
    });

    // initialize
    [0,1,2].forEach(c => recalcColumn(c));
});