let searchable = [
    "<span class='results-icon'><i class='fa fa-map-marker marker-icon' aria-hidden='true'></i></span><a href='results-hx7.html'>Specific address</a>",
    "<span class='results-icon'><i class='fa-solid fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='/map-v2/rivers-sea?center=-1.9974573597216632,53.7340615444713#'>Hebden Bridge</a>",
    "<span class='results-icon'><i class='fa-solid fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='results-hx7.html'>HX7</a>",
    "<span class='results-icon'><i class='fa-solid fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='results-hx7.html'>HX7 6EU</a>",
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
  
  // hide results when clicking outside of search

/* const mouse_is_inside = false;

$(document).ready(function()
{
    $('.search-results').hover(function(){ 
        mouse_is_inside=true; 
    }, function(){ 
        mouse_is_inside=false; 
    });

    $("body").mouseup(function(){ 
        if(! mouse_is_inside) $('.search-results').hide();
    });
}); */