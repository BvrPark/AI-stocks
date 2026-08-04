/**
 * WAFER AI Investment Dashboard
 * Theme Controller
 */


const THEME_STORAGE_KEY =
  "wafer-theme";



document.addEventListener(
  "DOMContentLoaded",
  initTheme
);





/**
 * 초기 테마 설정
 */
function initTheme(){


  const savedTheme =
    localStorage.getItem(
      THEME_STORAGE_KEY
    );



  if(savedTheme){


    setTheme(
      savedTheme
    );


  } else {


    // 사용자 시스템 설정 확인

    const prefersDark =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;



    if(prefersDark){

      setTheme(
        "dark"
      );


    }else{


      setTheme(
        "light"
      );


    }


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








/**
 * 테마 변경
 */
function toggleTheme(){


  const currentTheme =
    document.body.dataset.theme;



  if(
    currentTheme === "dark"
  ){


    setTheme(
      "light"
    );


  }else{


    setTheme(
      "dark"
    );


  }


}








/**
 * 테마 적용
 */
function setTheme(
  theme
){


  document.body.dataset.theme =
    theme;



  localStorage.setItem(
    THEME_STORAGE_KEY,
    theme
  );



  updateThemeButton(
    theme
  );


}









/**
 * 버튼 UI 변경
 */
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

    `
    ☀️ 주간
    `;


  }else{


    button.innerHTML =

    `
    🌙 야간
    `;


  }



}








/**
 * 외부에서 현재 테마 확인용
 */
function getCurrentTheme(){


  return document.body.dataset.theme;


}
