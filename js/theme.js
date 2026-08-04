/**
 * AI Stocks
 * Theme Controller
 */


const THEME_KEY =
  "aiStocksTheme";


document.addEventListener(
  "DOMContentLoaded",
  initializeTheme
);



function initializeTheme(){

  const savedTheme =
    localStorage.getItem(
      THEME_KEY
    );


  if(savedTheme){

    applyTheme(
      savedTheme
    );

  }


  const button =
    document.getElementById(
      "theme-toggle-button"
    );


  if(button){

    button.addEventListener(
      "click",
      toggleTheme
    );

  }


}





function toggleTheme(){

  const current =
    document.body.dataset.theme;


  if(
    current==="dark"
  ){

    applyTheme(
      "light"
    );

  }
  else{

    applyTheme(
      "dark"
    );

  }


}






function applyTheme(
  theme
){


  document.body.dataset.theme =
    theme;



  localStorage.setItem(
    THEME_KEY,
    theme
  );



  updateThemeButton(
    theme
  );


}





function updateThemeButton(
  theme
){


  const button =
    document.getElementById(
      "theme-toggle-button"
    );


  if(!button){

    return;

  }



  if(
    theme==="dark"
  ){

    button.innerHTML =
      "☀️ 주간";


  }
  else{


    button.innerHTML =
      "🌙 야간";


  }


}
