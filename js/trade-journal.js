/**
 * AI Stocks
 * Trade Journal Manager
 *
 * 매매일지 관리
 */


const TRADE_STORAGE_KEY =
  "aiStocksTrades";


let tradeList = [];





document.addEventListener(
  "DOMContentLoaded",
  initializeTradeJournal
);






/**
 * 초기화
 */
function initializeTradeJournal(){


  loadLocalTrades();


  initializeTradeModal();


  initializeTradeFilter();


  initializeTradeButtons();


  renderTradeJournal();


}





/**
 * 저장 데이터 불러오기
 */
function loadLocalTrades(){


  const saved =
    localStorage.getItem(
      TRADE_STORAGE_KEY
    );


  if(saved){

    try{

      tradeList =
        JSON.parse(saved);


    }catch(error){

      tradeList = [];

    }

  }


}





/**
 * 저장
 */
function saveLocalTrades(){


  localStorage.setItem(
    TRADE_STORAGE_KEY,
    JSON.stringify(
      tradeList
    )
  );


}







/**
 * 모달 이벤트
 */
function initializeTradeModal(){


  const openButton =
    document.getElementById(
      "open-trade-modal-button"
    );


  const closeButton =
    document.getElementById(
      "close-trade-modal-button"
    );


  const cancelButton =
    document.getElementById(
      "cancel-trade-button"
    );


  const modal =
    document.getElementById(
      "trade-modal"
    );



  if(openButton){

    openButton.addEventListener(
      "click",
      ()=>{

        openTradeModal();

      }

    );

  }




  [closeButton,cancelButton]
    .forEach(
      button=>{

        if(button){

          button.addEventListener(
            "click",
            closeTradeModal
          );

        }

      }
    );





  const form =
    document.getElementById(
      "trade-form"
    );


  if(form){

    form.addEventListener(
      "submit",
      saveTrade
    );

  }



}






function openTradeModal(){


  const modal =
    document.getElementById(
      "trade-modal"
    );


  if(modal){

    modal.classList.remove(
      "hidden"
    );


    document.body.classList.add(
      "modal-open"
    );

  }


}





function closeTradeModal(){


  const modal =
    document.getElementById(
      "trade-modal"
    );


  if(modal){

    modal.classList.add(
      "hidden"
    );


    document.body.classList.remove(
      "modal-open"
    );

  }



}





/**
 * 매매 저장
 */
function saveTrade(event){


  event.preventDefault();



  const trade = {


    id:
      Date.now(),



    source:
      "manual",



    date:
      document.getElementById(
        "trade-date-input"
      ).value,



    symbol:
      document.getElementById(
        "trade-symbol-input"
      ).value
      .toUpperCase(),



    direction:
      document.getElementById(
        "trade-direction-input"
      ).value,



    quantity:
      Number(
        document.getElementById(
          "trade-quantity-input"
        ).value
      ),



    entryPrice:
      Number(
        document.getElementById(
          "trade-entry-price-input"
        ).value
      ),



    exitPrice:
      Number(
        document.getElementById(
          "trade-exit-price-input"
        ).value
      ),



    fee:
      Number(
        document.getElementById(
          "trade-fee-input"
        ).value
      )
      ||0,



    reason:
      document.getElementById(
        "trade-reason-input"
      ).value,



    createdAt:
      new Date().toISOString()


  };




  tradeList.unshift(
    trade
  );



  saveLocalTrades();


  renderTradeJournal();



  closeTradeModal();



  event.target.reset();



  showNotice(
    "저장 완료",
    "매매일지가 등록되었습니다.",
    "success"
  );


}







/**
 * 테이블 출력
 */
function renderTradeJournal(
  data = tradeList
){


  const tbody =
    document.getElementById(
      "trade-journal-table-body"
    );



  if(!tbody){

    return;

  }





  updateTradeSummary(
    data
  );





  if(
    data.length===0
  ){


    tbody.innerHTML = `

    <tr class="empty-table-row">

      <td colspan="10">

        <div class="empty-state">

          <span class="empty-state-icon">
          ✎
          </span>


          <strong>
          등록된 매매일지가 없습니다.
          </strong>


          <p>
          직접 기록하거나 토스 체결내역을 동기화하세요.
          </p>

        </div>

      </td>

    </tr>

    `;


    return;

  }






  tbody.innerHTML =

    data.map(
      trade=>{


        const profit =
          calculateProfit(
            trade
          );


        const rate =
          calculateReturn(
            trade
          );



        return `

        <tr>

          <td>
          ${trade.date}
          </td>


          <td>
          ${trade.symbol}
          </td>


          <td>

          <span class="
          journal-source-badge
          journal-source-${trade.source}
          ">

          ${
            trade.source==="toss"
            ?
            "토스"
            :
            "직접입력"
          }

          </span>

          </td>


          <td>
          ${trade.quantity}
          </td>


          <td>
          ${formatMoney(
            trade.entryPrice
          )}
          </td>


          <td>
          ${formatMoney(
            trade.exitPrice
          )}
          </td>


          <td class="
          ${
            profit>=0
            ?
            "positive-text"
            :
            "negative-text"
          }
          ">

          ${formatMoney(
            profit
          )}

          </td>



          <td class="
          ${
            rate>=0
            ?
            "positive-text"
            :
            "negative-text"
          }
          ">

          ${formatPercent(
            rate
          )}

          </td>


          <td>
          ${trade.reason || "-"}
          </td>


          <td>

          <button
          class="table-action-button delete"
          onclick="deleteTrade(${trade.id})"
          >
          삭제
          </button>

          </td>


        </tr>


        `;


      }
    )
    .join("");



}








/**
 * 손익 계산
 */
function calculateProfit(
  trade
){


  let profit =

    (
      trade.exitPrice -
      trade.entryPrice
    )
    *
    trade.quantity;



  if(
    trade.direction==="short"
  ){

    profit *= -1;

  }



  return (
    profit -
    trade.fee
  );


}







/**
 * 수익률
 */
function calculateReturn(
  trade
){


  if(
    !trade.entryPrice
  ){

    return 0;

  }



  return (

    (
      calculateProfit(
        trade
      )
      /
      (
        trade.entryPrice *
        trade.quantity
      )
    )
    *
    100

  );


}






/**
 * 통계
 */
function updateTradeSummary(
  data
){


  const profits =
    data.map(
      calculateProfit
    );



  const total =
    profits.reduce(
      (a,b)=>a+b,
      0
    );



  const wins =
    profits.filter(
      value=>value>0
    )
    .length;



  const count =
    data.length;



  const winRate =
    count===0
    ?
    0
    :
    (
      wins/count
    )
    *
    100;



  const avgReturn =
    count===0
    ?
    0
    :
    data.reduce(
      (
        sum,
        item
      )=>
        sum+
        calculateReturn(
          item
        ),
      0
    )
    /
    count;




  document.getElementById(
    "journal-realized-profit"
  ).textContent =
    formatMoney(
      total
    );



  document.getElementById(
    "journal-win-rate"
  ).textContent =
    formatPercent(
      winRate
    );



  document.getElementById(
    "journal-trade-count"
  ).textContent =
    count;



  document.getElementById(
    "journal-average-return"
  ).textContent =
    formatPercent(
      avgReturn
    );


}







/**
 * 삭제
 */
function deleteTrade(
  id
){


  tradeList =
    tradeList.filter(
      item=>
        item.id!==id
    );



  saveLocalTrades();


  renderTradeJournal();


}








/**
 * 필터
 */
function initializeTradeFilter(){


  const symbolFilter =
    document.getElementById(
      "journal-symbol-filter"
    );


  const sourceFilter =
    document.getElementById(
      "journal-source-filter"
    );



  [
    symbolFilter,
    sourceFilter

  ].forEach(
    element=>{

      if(element){

        element.addEventListener(
          "change",
          applyTradeFilter
        );

      }

    }

  );



}





function applyTradeFilter(){


  const symbol =
    document.getElementById(
      "journal-symbol-filter"
    )
    .value;



  const source =
    document.getElementById(
      "journal-source-filter"
    )
    .value;



  const filtered =
    tradeList.filter(
      item=>{


        return (

          (!symbol ||
          item.symbol===symbol)

          &&

          (!source ||
          item.source===source)

        );


      }
    );



  renderTradeJournal(
    filtered
  );


}
