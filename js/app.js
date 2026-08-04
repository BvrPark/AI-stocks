/**
 * WAFER AI Dashboard
 * Main Controller
 */


document.addEventListener(
  "DOMContentLoaded",
  initApp
);



async function initApp(){


  initializeNavigation();


  initializeRefresh();


  updateDate();


  await checkApiStatus();


}





/**
 * 메뉴 활성화
 */
function initializeNavigation(){


  const menus =
    document.querySelectorAll(
      ".menu-item"
    );



  menus.forEach(
    menu=>{


      menu.addEventListener(
        "click",
        ()=>{


          menus.forEach(
            item=>
              item.classList.remove(
                "active"
              )
          );


          menu.classList.add(
            "active"
          );


        }
      );


    }
  );


}







/**
 * 새로고침
 */
function initializeRefresh(){


  const button =
    document.querySelector(
      ".refresh-button"
    );


  if(!button){

    return;

  }


  button.addEventListener(
    "click",
    async()=>{


      await loadDashboard();


    }
  );


}







/**
 * API 상태 확인
 */
async function checkApiStatus(){


  try{


    const result =
      await checkTossConnection();



    updateApiStatus(
      true,
      result.message
    );


  }catch(error){


    updateApiStatus(
      false,
      "API 연결 필요"
    );


  }


}







function updateApiStatus(
  connected,
  message
){


  const status =
    document.querySelector(
      ".api-status p"
    );


  const dot =
    document.querySelector(
      ".status-dot"
    );



  if(status){

    status.textContent =
      connected
      ?
      "연결 완료"
      :
      message;


  }



  if(dot){

    dot.style.background =
      connected
      ?
      "#19a974"
      :
      "#facc15";

  }



}








/**
 * 날짜 표시
 */
function updateDate(){


  const element =
    document.querySelector(
      ".date"
    );


  if(!element){

    return;

  }



  const today =
    new Date();



  element.textContent =
    today
      .toLocaleDateString(
        "ko-KR"
      );


}








/**
 * 전체 데이터 로딩
 */
async function loadDashboard(){


  try{


    if(
      typeof loadPortfolio ===
      "function"
    ){

      await loadPortfolio();

    }



    if(
      typeof loadTrades ===
      "function"
    ){

      await loadTrades();

    }



  }catch(error){


    console.error(
      error
    );


  }


}
