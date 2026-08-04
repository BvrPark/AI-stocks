/**
 * AI Stocks
 * Main Application Controller
 */


document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);



/**
 * 앱 시작
 */
async function initializeApp(){

  initializeMobileMenu();

  initializeNavigation();

  initializeGoalSetting();

  initializeButtons();


  updateLastUpdatedTime();


  await checkApiStatus();


}





/**
 * 버튼 이벤트 등록
 */
function initializeButtons(){


  const refreshButton =
    document.getElementById(
      "refresh-dashboard-button"
    );


  if(refreshButton){

    refreshButton.addEventListener(
      "click",
      async ()=>{

        showLoading(
          "최신 데이터를 불러오는 중입니다."
        );


        try{

          await loadDashboardData();

          showNotice(
            "업데이트 완료",
            "최신 데이터를 반영했습니다.",
            "success"
          );


        }catch(error){

          showNotice(
            "업데이트 실패",
            error.message,
            "error"
          );


        }finally{

          hideLoading();

        }


      }
    );

  }



  const checkApiButton =
    document.getElementById(
      "check-api-button"
    );


  if(checkApiButton){

    checkApiButton.addEventListener(
      "click",
      checkApiStatus
    );

  }


}





/**
 * API 연결 상태 확인
 */
async function checkApiStatus(){


  try{


    const result =
      await checkTossConnection();



    updateApiStatusUI(
      true,
      result.message ||
      "토스 API 연결 가능"
    );



  }catch(error){


    updateApiStatusUI(
      false,
      error.message
    );


  }


}





/**
 * API 상태 UI 변경
 */
function updateApiStatusUI(
  connected,
  message
){


  const badge =
    document.getElementById(
      "connection-badge"
    );


  const badgeText =
    document.getElementById(
      "connection-badge-text"
    );


  const sidebarDot =
    document.getElementById(
      "sidebar-api-status-dot"
    );


  const sidebarTitle =
    document.getElementById(
      "sidebar-api-status-title"
    );


  const sidebarMessage =
    document.getElementById(
      "sidebar-api-status-message"
    );



  if(badge){

    badge.className =
      connected
        ? 
        "connection-badge connection-connected"
        :
        "connection-badge connection-error";

  }



  if(badgeText){

    badgeText.textContent =
      connected
        ?
        "API 연결 완료"
        :
        "API 연결 필요";

  }



  if(sidebarDot){

    sidebarDot.className =
      connected
        ?
        "status-dot status-dot-connected"
        :
        "status-dot status-dot-error";

  }



  if(sidebarTitle){

    sidebarTitle.textContent =
      connected
        ?
        "토스 API 연결됨"
        :
        "토스 API 미연결";

  }



  if(sidebarMessage){

    sidebarMessage.textContent =
      message;

  }



}





/**
 * 대시보드 데이터 로딩
 *
 * 추후 portfolio.js 연결
 */
async function loadDashboardData(){


  try{


    const portfolio =
      await getPortfolio();



    renderAccountSummary(
      portfolio
    );



  }catch(error){


    console.log(
      "포트폴리오 조회 대기:",
      error.message
    );


  }


}





/**
 * 계좌 요약 표시
 */
function renderAccountSummary(
  data
){


  if(!data){

    return;

  }



  const mapping = {

    "total-evaluation-amount":
      data.totalBalance,


    "cash-balance":
      data.cashBalance,


    "available-order-amount":
      data.availableAmount,


    "total-purchase-amount":
      data.purchaseAmount,


  };



  Object.keys(mapping)
    .forEach(
      id=>{

        const element =
          document.getElementById(
            id
          );


        if(element){

          element.textContent =
            formatMoney(
              mapping[id]
            );

        }

      }
    );


}





/**
 * 마지막 업데이트 시간
 */
function updateLastUpdatedTime(){


  const element =
    document.getElementById(
      "last-updated-at"
    );


  if(element){

    element.textContent =
      formatDate(
        new Date()
      );

  }


}







/**
 * 모바일 메뉴
 */
function initializeMobileMenu(){


  const sidebar =
    document.getElementById(
      "sidebar"
    );


  const overlay =
    document.getElementById(
      "sidebar-overlay"
    );


  const openButton =
    document.getElementById(
      "mobile-menu-button"
    );


  const closeButton =
    document.getElementById(
      "mobile-close-button"
    );



  function openMenu(){

    sidebar.classList.add(
      "open"
    );

    overlay.classList.add(
      "visible"
    );

  }



  function closeMenu(){

    sidebar.classList.remove(
      "open"
    );

    overlay.classList.remove(
      "visible"
    );

  }



  if(openButton){

    openButton.addEventListener(
      "click",
      openMenu
    );

  }



  if(closeButton){

    closeButton.addEventListener(
      "click",
      closeMenu
    );

  }



  if(overlay){

    overlay.addEventListener(
      "click",
      closeMenu
    );

  }


}





/**
 * 메뉴 이동
 */
function initializeNavigation(){


  const links =
    document.querySelectorAll(
      ".nav-link"
    );



  links.forEach(
    link=>{

      link.addEventListener(
        "click",
        ()=>{

          links.forEach(
            item=>
              item.classList.remove(
                "active"
              )
          );


          link.classList.add(
            "active"
          );

        }
      );


    }
  );


}





/**
 * 목표 설정
 */
function initializeGoalSetting(){


  const goalInput =
    document.getElementById(
      "goal-amount-input"
    );


  const targetText =
    document.getElementById(
      "goal-target-amount"
    );



  const saveForm =
    document.getElementById(
      "goal-settings-form"
    );



  const savedGoal =
    localStorage.getItem(
      "aiStocksGoal"
    );



  if(savedGoal){


    const goal =
      Number(savedGoal);



    if(goalInput){

      goalInput.value =
        goal;

    }



    if(targetText){

      targetText.textContent =
        formatMoney(
          goal,
          "KRW"
        );

    }


  }




  if(saveForm){


    saveForm.addEventListener(
      "submit",
      event=>{


        event.preventDefault();



        const value =
          Number(
            goalInput.value
          );



        if(
          !value ||
          value <=0
        ){

          return;

        }



        localStorage.setItem(
          "aiStocksGoal",
          value
        );



        if(targetText){

          targetText.textContent =
            formatMoney(
              value,
              "KRW"
            );

        }



        showNotice(
          "저장 완료",
          "목표금액이 저장되었습니다.",
          "success"
        );


      }
    );


  }


}






/**
 * 알림 표시
 */
function showNotice(
  title,
  message,
  type="success"
){


  const banner =
    document.getElementById(
      "notice-banner"
    );


  const titleElement =
    document.getElementById(
      "notice-title"
    );


  const messageElement =
    document.getElementById(
      "notice-message"
    );



  if(!banner){

    return;

  }



  banner.classList.remove(
    "hidden"
  );



  titleElement.textContent =
    title;


  messageElement.textContent =
    message;



  banner.dataset.type =
    type;


}





/**
 * 로딩 표시
 */
function showLoading(
  message
){


  const overlay =
    document.getElementById(
      "loading-overlay"
    );


  const text =
    document.getElementById(
      "loading-message"
    );



  if(text){

    text.textContent =
      message;

  }



  if(overlay){

    overlay.classList.remove(
      "hidden"
    );

  }


}





function hideLoading(){


  const overlay =
    document.getElementById(
      "loading-overlay"
    );



  if(overlay){

    overlay.classList.add(
      "hidden"
    );

  }


}
