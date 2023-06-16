let searchable = [
    "<span class='results-icon'><i class='fa fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='/version_5/map-v3/surface-water?marker=true&scenario=undefined&center=-1.0657164902394267,53.78279878339853'>Selby</a>",
    "<span class='results-icon'><i class='fa-solid fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='/version_5/map-v3/surface-water?marker=true&scenario=undefined&center=-1.0903145024537895,53.77866456981306'>YO8 4JN</a>",
    "<span class='results-icon'><i class='fa fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='/version_5/map-v3/surface-water?marker=true&scenario=undefined&center=0.40479826911781025,52.24382656827248'>CB8 0HL</a>",
    "<span class='results-icon'><i class='fa fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='/version_5/map-v3surface-water?marker=true&scenario=undefined&center=0.40918842995999904,52.24232698675024'>Newmarket</a>",
    "<span class='results-icon'><i class='fa-solid fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='/version_5/map-v3/surface-water?marker=true&scenario=17&center=-2.0123351616190766,53.74081703837396'>Hebden Bridge</a>",
    "<span class='results-icon'><i class='fa-solid fa-map-location-dot map-icon' aria-hidden='true'></i></span><a href='/version_5/map-v3/rivers-sea?marker=true&scenario=15&center=-0.10796609602530668,51.5123465968953'>London</a>",
    
  ];
  
  const searchInput = document.getElementById('search-v3');
  const searchWrapper = document.querySelector('.search-wrapper-v3');
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