/**
 * AI Stocks
 * Portfolio Manager
 *
 * 담당
 * 1. 계좌 보유종목 표시
 * 2. 평가손익 계산
 * 3. 수익률 계산
 * 4. 종목 검색
 */


let portfolioData = [];



document.addEventListener(
  "DOMContentLoaded",
  initializePortfolio
);



/**
 * 초기화
 */
function initializePortfolio(){

  initializePortfolioSearch();

}





/**
 * 포트폴리오 데이터 로딩
 */
async function loadPortfolio(){


  try{


    const response =
      await getPortfolio();



    portfolioData =
      response.holdings || [];



    renderPortfolio(
      portfolioData
    );



  }catch(error){


    console.error(
      "포트폴리오 조회 실패",
      error
    );


    renderPortfolioEmpty(
      error.message
    );


  }


}





/**
 * 보유 종목 출력
 */
function renderPortfolio(
  holdings
){


  const tbody =
    document.getElementById(
      "portfolio-table-body"
    );



  if(!tbody){

    return;

  }



  if(
    !holdings ||
    holdings.length === 0
  ){


    renderPortfolioEmpty(
      "보유 종목 데이터가 없습니다."
    );


    return;

  }




  tbody.innerHTML =
    holdings
      .map(
        item=>{


          const profit =
            calculateHoldingProfit(
              item
            );


          const rate =
            calculateHoldingRate(
              item
            );



          return `

          <tr>

            <td>

              <div class="symbol-cell">

                <div class="symbol-logo">
                  ${item.symbol}
                </div>


                <div>

                  <strong>
                    ${item.name || item.symbol}
                  </strong>

                  <span>
                    ${item.market || "US"}
                  </span>

                </div>

              </div>

            </td>


            <td>
              ${formatNumber(item.quantity)}
            </td>


            <td>
              ${formatMoney(item.averagePrice)}
            </td>


            <td>
              ${formatMoney(item.currentPrice)}
            </td>


            <td>
              ${formatMoney(item.purchaseAmount)}
            </td>


            <td>
              ${formatMoney(item.evaluationAmount)}
            </td>


            <td class="${profit >=0 ? "positive-text":"negative-text"}">

              ${formatMoney(profit)}

            </td>


            <td class="${rate >=0 ? "positive-text":"negative-text"}">

              ${formatPercent(rate)}

            </td>


          </tr>

          `;


        }
      )
      .join("");



}







/**
 * 데이터 없음 표시
 */
function renderPortfolioEmpty(
  message
){


  const tbody =
    document.getElementById(
      "portfolio-table-body"
    );


  if(!tbody){

    return;

  }



  tbody.innerHTML = `

  <tr class="empty-table-row">

    <td colspan="8">

      <div class="empty-state">

        <span class="empty-state-icon">
          !
        </span>


        <strong>
          ${message}
        </strong>


        <p>
          토스 API 연결 후 실제 계좌 정보가 표시됩니다.
        </p>

      </div>


    </td>

  </tr>

  `;


}







/**
 * 평가손익 계산
 */
function calculateHoldingProfit(
  item
){


  if(
    item.evaluationAmount === undefined
  ){

    return 0;

  }



  return (
    item.evaluationAmount -
    item.purchaseAmount
  );


}






/**
 * 수익률 계산
 */
function calculateHoldingRate(
  item
){


  if(
    !item.purchaseAmount
  ){

    return 0;

  }



  return (

    (
      (
        item.evaluationAmount -
        item.purchaseAmount
      )
      /
      item.purchaseAmount
    )
    *
    100

  );


}







/**
 * 숫자 표시
 */
function formatNumber(
  value
){


  if(
    value === undefined ||
    value === null
  ){

    return "-";

  }



  return new Intl.NumberFormat(
    "ko-KR",
    {

      maximumFractionDigits:4

    }

  ).format(
    value
  );


}








/**
 * 검색
 */
function initializePortfolioSearch(){


  const input =
    document.getElementById(
      "portfolio-search-input"
    );



  if(!input){

    return;

  }




  input.addEventListener(
    "input",
    ()=>{


      const keyword =
        input.value
          .trim()
          .toUpperCase();



      const filtered =
        portfolioData.filter(
          item=>{


            return (

              item.symbol
                ?.toUpperCase()
                .includes(keyword)

              ||

              item.name
                ?.toUpperCase()
                .includes(keyword)

            );


          }
        );



      renderPortfolio(
        filtered
      );


    }
  );


}
