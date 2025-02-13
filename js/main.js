async function loadData(type) {
    try {
        const response = await fetch('database/db.json');
        const data = await response.json();
        return data[type];
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        return [];
    }
}

async function displayItems(type, containerId) {
    const container = document.getElementById(containerId);
    const items = await loadData(type);

    items.forEach(item => {
        const itemElement = document.createElement('article');
        itemElement.className = 'item-card animate';
        itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="item-image">
        <div class="item-content">
            <h3>${item.title}</h3>
            <p>${item.shortDescription}</p>
            <a href="detail.html?type=${type}&id=${item.id}" class="read-more">بینینی وردەکاری</a>
        </div>
      `;
        container.appendChild(itemElement);
    });
}

async function loadAboutData() {
    try {
        const response = await fetch('database/db.json');
        const data = await response.json();
        const about = data.about || {}; // دەتوانیت زانیارییەکانی دەربارەی خۆت لێرە زیاد بکەیت
        if (about.title) {
            document.querySelector('.about-content').innerHTML = `
            <h2>${about.title}</h2>
            <p>${about.bio}</p>
            <div class="skills">
                <h4>لێهاتووییەکان</h4>
                <div class="skills-list">
                    ${about.skills ? about.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('') : ''}
                </div>
            </div>
        `;
      }
    } catch (error) {
      console.error('Error loading about data:', error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    // بارکردنی پڕۆژەکان و ڕاپۆرتەکان
    displayItems('projects', 'projectsContainer');
    displayItems('reports', 'reportsContainer');
    loadAboutData();
    
    // Smooth scroll بۆ ناو لینکەکان
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
  });