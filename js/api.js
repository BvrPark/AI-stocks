/**
 * AI Stocks
 * API Communication Layer
 *
 * 역할
 * 1. Netlify Functions 호출
 * 2. 토스 API 데이터 전달
 * 3. 오류 공통 처리
 */


const API_CONFIG = {
  baseUrl: "/.netlify/functions",
  timeout: 15000,
};


/**
 * 공통 API 호출 함수
 */
async function apiRequest(
  endpoint,
  options = {}
) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, API_CONFIG.timeout);


  try {

    const response = await fetch(
      `${API_CONFIG.baseUrl}/${endpoint}`,
      {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      }
    );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "API 요청 실패"
      );

    }


    return data;


  } catch(error) {


    if(error.name === "AbortError") {

      throw new Error(
        "API 요청 시간이 초과되었습니다."
      );

    }


    throw error;


  } finally {

    clearTimeout(timeout);

  }

}



/**
 * 토스 API 연결 상태 확인
 */
async function checkTossConnection(){

  return await apiRequest(
    "status"
  );

}



/**
 * 계좌 정보 조회
 *
 * 반환 예정 데이터
 *
 * {
 *   totalBalance,
 *   cashBalance,
 *   availableAmount,
 *   holdings:[]
 * }
 */
async function getPortfolio(){

  return await apiRequest(
    "portfolio"
  );

}



/**
 * 종목 현재가 조회
 *
 * symbols
 *
 * [
 *   "SOXL",
 *   "SOXS"
 * ]
 */
async function getQuotes(
  symbols
){

  return await apiRequest(
    "quotes",
    {

      method:"POST",

      body:JSON.stringify({
        symbols
      })

    }
  );

}




/**
 * 토스 체결 내역 조회
 */
async function getExecutions(){

  return await apiRequest(
    "executions"
  );

}



/**
 * 매매일지 조회
 */
async function getTrades(){

  return await apiRequest(
    "trades"
  );

}



/**
 * 매매일지 저장
 */
async function createTrade(
  trade
){

  return await apiRequest(
    "trades",
    {

      method:"POST",

      body:
        JSON.stringify(
          trade
        )

    }
  );

}



/**
 * 매매일지 삭제
 */
async function deleteTrade(
  tradeId
){

  return await apiRequest(
    `trades?id=${tradeId}`,
    {

      method:"DELETE"

    }
  );

}




/**
 * 숫자 포맷
 */
function formatMoney(
  value,
  currency="USD"
){

  if(
    value === null ||
    value === undefined
  ){

    return "-";

  }


  return new Intl.NumberFormat(
    "ko-KR",
    {

      style:"currency",

      currency,

      maximumFractionDigits:2

    }

  ).format(value);

}



/**
 * 퍼센트 포맷
 */
function formatPercent(
  value
){

  if(
    value === null ||
    value === undefined
  ){

    return "-";

  }


  const sign =
    value > 0
      ? "+"
      : "";


  return `${sign}${value.toFixed(2)}%`;

}



/**
 * 날짜 포맷
 */
function formatDate(
  date
){

  if(!date){

    return "-";

  }


  return new Intl.DateTimeFormat(
    "ko-KR",
    {

      year:"numeric",

      month:"2-digit",

      day:"2-digit",

      hour:"2-digit",

      minute:"2-digit"

    }

  ).format(
    new Date(date)
  );

}
