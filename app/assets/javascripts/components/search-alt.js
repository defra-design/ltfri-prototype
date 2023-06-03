let searchable = [
    "<span class='results-icon'><i class='fa fa-map-marker marker-icon' aria-hidden='true'></i></span><a href='#'>64, West Park, Selby, YO8 4JN</a>",
    "<span class='results-icon'><i class='fa-solid fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='/map-v2-alt/surface-water?marker=true&scenario=17&center=-2.0123351616190766,53.74081703837396'>Hebden Bridge</a>",
    "<span class='results-icon'><i class='fa-solid fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='/map-v2-alt/surface-water?marker=true&scenario=undefined&center=-1.0903145024537895,53.77866456981306'>YO8 4JN</a>",
    "<span class='results-icon'><i class='fa fa-map-marker marker-icon' aria-hidden='true'></i></span><a href='/map-v2/surface-water?marker=true&scenario=4'>3 Rockingham Villas, Church Lane, Newmarket, CB8 0HL</a>",
    "<span class='results-icon'><i class='fa-solid fa-map-location-dot marker-icon' aria-hidden='true'></i></span><a href='/map-v2-alt/surface-water?marker=true&scenario=undefined&center=0.40479826911781025,52.24382656827248'>CB8 0HL</a>",
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