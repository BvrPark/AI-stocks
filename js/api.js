const API_BASE_URL = "/.netlify/functions";


async function apiRequest(endpoint, options = {}) {

  try {

    const response = await fetch(
      `${API_BASE_URL}/${endpoint}`,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json"
        },
        body: options.body
          ? JSON.stringify(options.body)
          : undefined
      }
    );


    const data = await response.json();


    if (!response.ok) {
      throw new Error(
        data.message || "API 요청 실패"
      );
    }


    return data;


  } catch (error) {

    console.error(
      "API Error:",
      error
    );

    throw error;

  }

}


/**
 * Toss API 연결 상태 확인
 */
async function checkTossConnection() {

  return await apiRequest(
    "status"
  );

}



/**
 * 계좌 정보 조회
 */
async function getAccount() {

  return await apiRequest(
    "portfolio"
  );

}



/**
 * 보유 종목 조회
 */
async function getPortfolio() {

  return await apiRequest(
    "portfolio"
  );

}



/**
 * 현재가 조회
 */
async function getQuotes(symbols) {

  return await apiRequest(
    "quotes",
    {
      method:"POST",
      body:{
        symbols
      }
    }
  );

}



/**
 * 체결 내역 조회
 */
async function getExecutions() {

  return await apiRequest(
    "executions"
  );

}



/**
 * 매매일지 조회
 */
async function getTrades() {

  return await apiRequest(
    "trades"
  );

}



/**
 * 매매일지 저장
 */
async function saveTrade(
  trade
) {

  return await apiRequest(
    "trades",
    {
      method:"POST",
      body:trade
    }
  );

}



/**
 * 매매일지 삭제
 */
async function removeTrade(
  id
) {

  return await apiRequest(
    `trades?id=${id}`,
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
) {

  if(
    value === null ||
    value === undefined
  ) {
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
) {

  if(
    value === null ||
    value === undefined
  ) {
    return "-";
  }


  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

}



/**
 * 숫자 포맷
 */
function formatNumber(
  value
) {

  if(
    value === null ||
    value === undefined
  ) {
    return "-";
  }


  return new Intl.NumberFormat(
    "ko-KR"
  ).format(value);

}
