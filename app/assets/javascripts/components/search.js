let searchable = [
    "<a href='results-hx7.html'>TEST</a>",
    'Hebden Bridge',
    'HX7',
    'HX7 6EU',
  ];
  
  const searchInput = document.getElementById('search');
  const searchWrapper = document.querySelector('.search-wrapper');
  const resultsWrapper = document.querySelector('.search-results');
  
  searchInput.addEventListener('keyup', () => {
    let results = [];
    let input = searchInput.value;
    if (input.length) {
      results = searchable.filter((item) => {
        return item.toLowerCase().includes(input.toLowerCase());
      });
    }
    renderResults(results);
  });
  
  function renderResults(results) {
    if (!results.length) {
      return searchWrapper.classList.remove('show');
    }
  
    const content = results
      .map((item) => {
        return `<li><a href='#'>${item}</a></li>`;
      })
      .join('');
  
    searchWrapper.classList.add('show');
    resultsWrapper.innerHTML = `<ul>${content}</ul>`;
  }
  

  window.onload = function(){
    let input = document.querySelector('search-wrapper');
    input.value = 'Some test search';
    input.style.removeProperty('background');   
};