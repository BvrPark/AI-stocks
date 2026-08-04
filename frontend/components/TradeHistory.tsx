"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type TradeSide = "매수" | "매도";

interface Trade {
  id: string;
  date: string;
  symbol: string;
  side: TradeSide;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  fee: number;
  memo: string;
}

const STORAGE_KEY = "wafer-trade-history";

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  symbol: "SOXL",
  side: "매수" as TradeSide,
  entryPrice: "",
  exitPrice: "",
  quantity: "",
  fee: "0",
  memo: "",
};

export default function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedTrades = localStorage.getItem(STORAGE_KEY);

      if (savedTrades) {
        setTrades(JSON.parse(savedTrades));
      }
    } catch (error) {
      console.error("매매일지 불러오기 실패:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades, isLoaded]);

  const calculateProfit = (trade: Trade) => {
    const direction = trade.side === "매수" ? 1 : -1;

    return (
      (trade.exitPrice - trade.entryPrice) *
        trade.quantity *
        direction -
      trade.fee
    );
  };

  const calculateReturnRate = (trade: Trade) => {
    if (trade.entryPrice <= 0) {
      return 0;
    }

    const direction = trade.side === "매수" ? 1 : -1;

    return (
      ((trade.exitPrice - trade.entryPrice) /
        trade.entryPrice) *
      100 *
      direction
    );
  };

  const summary = useMemo(() => {
    const completedTrades = trades.filter(
      (trade) => trade.entryPrice > 0 && trade.exitPrice > 0,
    );

    const totalProfit = completedTrades.reduce(
      (sum, trade) => sum + calculateProfit(trade),
      0,
    );

    const winningTrades = completedTrades.filter(
      (trade) => calculateProfit(trade) > 0,
    ).length;

    const winRate =
      completedTrades.length > 0
        ? (winningTrades / completedTrades.length) * 100
        : 0;

    return {
      totalProfit,
      winRate,
      tradeCount: completedTrades.length,
    };
  }, [trades]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const entryPrice = Number(form.entryPrice);
    const exitPrice = Number(form.exitPrice);
    const quantity = Number(form.quantity);
    const fee = Number(form.fee || 0);

    if (!form.date || !form.symbol.trim()) {
      alert("거래일과 종목을 입력해 주세요.");
      return;
    }

    if (
      entryPrice <= 0 ||
      exitPrice <= 0 ||
      quantity <= 0 ||
      fee < 0
    ) {
      alert("가격과 수량을 올바르게 입력해 주세요.");
      return;
    }

    const newTrade: Trade = {
      id: crypto.randomUUID(),
      date: form.date,
      symbol: form.symbol.trim().toUpperCase(),
      side: form.side,
      entryPrice,
      exitPrice,
      quantity,
      fee,
      memo: form.memo.trim(),
    };

    setTrades((currentTrades) => [
      newTrade,
      ...currentTrades,
    ]);

    setForm({
      ...initialForm,
      date: form.date,
      symbol: form.symbol,
    });
  };

  const handleDelete = (tradeId: string) => {
    const shouldDelete = window.confirm(
      "해당 거래 기록을 삭제할까요?",
    );

    if (!shouldDelete) {
      return;
    }

    setTrades((currentTrades) =>
      currentTrades.filter((trade) => trade.id !== tradeId),
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="card trade-history-card">
      <div className="trade-section-header">
        <div>
          <h2>매매일지</h2>
          <p className="trade-description">
            거래 내역과 손익을 직접 기록합니다.
          </p>
        </div>

        <div className="trade-summary">
          <div>
            <span>누적 손익</span>
            <strong
              className={
                summary.totalProfit >= 0 ? "green" : "red"
              }
            >
              {summary.totalProfit >= 0 ? "+" : ""}
              {formatCurrency(summary.totalProfit)}
            </strong>
          </div>

          <div>
            <span>승률</span>
            <strong>{summary.winRate.toFixed(1)}%</strong>
          </div>

          <div>
            <span>거래 수</span>
            <strong>{summary.tradeCount}건</strong>
          </div>
        </div>
      </div>

      <form
        className="trade-form"
        onSubmit={handleSubmit}
      >
        <div className="trade-form-field">
          <label htmlFor="trade-date">거래일</label>
          <input
            id="trade-date"
            type="date"
            value={form.date}
            onChange={(event) =>
              setForm({
                ...form,
                date: event.target.value,
              })
            }
          />
        </div>

        <div className="trade-form-field">
          <label htmlFor="trade-symbol">종목</label>
          <input
            id="trade-symbol"
            type="text"
            placeholder="SOXL"
            value={form.symbol}
            onChange={(event) =>
              setForm({
                ...form,
                symbol: event.target.value,
              })
            }
          />
        </div>

        <div className="trade-form-field">
          <label htmlFor="trade-side">포지션</label>
          <select
            id="trade-side"
            value={form.side}
            onChange={(event) =>
              setForm({
                ...form,
                side: event.target.value as TradeSide,
              })
            }
          >
            <option value="매수">매수</option>
            <option value="매도">매도</option>
          </select>
        </div>

        <div className="trade-form-field">
          <label htmlFor="entry-price">진입가</label>
          <input
            id="entry-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.entryPrice}
            onChange={(event) =>
              setForm({
                ...form,
                entryPrice: event.target.value,
              })
            }
          />
        </div>

        <div className="trade-form-field">
          <label htmlFor="exit-price">청산가</label>
          <input
            id="exit-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.exitPrice}
            onChange={(event) =>
              setForm({
                ...form,
                exitPrice: event.target.value,
              })
            }
          />
        </div>

        <div className="trade-form-field">
          <label htmlFor="trade-quantity">수량</label>
          <input
            id="trade-quantity"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.quantity}
            onChange={(event) =>
              setForm({
                ...form,
                quantity: event.target.value,
              })
            }
          />
        </div>

        <div className="trade-form-field">
          <label htmlFor="trade-fee">수수료</label>
          <input
            id="trade-fee"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.fee}
            onChange={(event) =>
              setForm({
                ...form,
                fee: event.target.value,
              })
            }
          />
        </div>

        <div className="trade-form-field trade-memo-field">
          <label htmlFor="trade-memo">매매 근거</label>
          <input
            id="trade-memo"
            type="text"
            placeholder="예: RSI 반등 및 20일선 돌파"
            value={form.memo}
            onChange={(event) =>
              setForm({
                ...form,
                memo: event.target.value,
              })
            }
          />
        </div>

        <button className="trade-submit-button" type="submit">
          거래 기록
        </button>
      </form>

      <div className="trade-table-wrapper">
        <table className="trade-table">
          <thead>
            <tr>
              <th>거래일</th>
              <th>종목</th>
              <th>포지션</th>
              <th>진입가</th>
              <th>청산가</th>
              <th>수량</th>
              <th>손익</th>
              <th>수익률</th>
              <th>매매 근거</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="trade-empty"
                >
                  아직 저장된 거래가 없습니다.
                </td>
              </tr>
            ) : (
              trades.map((trade) => {
                const profit = calculateProfit(trade);
                const returnRate =
                  calculateReturnRate(trade);
                const resultClass =
                  profit >= 0 ? "green" : "red";

                return (
                  <tr key={trade.id}>
                    <td>{trade.date}</td>
                    <td>
                      <strong>{trade.symbol}</strong>
                    </td>
                    <td>
                      <span
                        className={`trade-side ${
                          trade.side === "매수"
                            ? "trade-buy"
                            : "trade-sell"
                        }`}
                      >
                        {trade.side}
                      </span>
                    </td>
                    <td>
                      {formatCurrency(trade.entryPrice)}
                    </td>
                    <td>
                      {formatCurrency(trade.exitPrice)}
                    </td>
                    <td>{trade.quantity}</td>
                    <td className={resultClass}>
                      {profit >= 0 ? "+" : ""}
                      {formatCurrency(profit)}
                    </td>
                    <td className={resultClass}>
                      {returnRate >= 0 ? "+" : ""}
                      {returnRate.toFixed(2)}%
                    </td>
                    <td className="trade-memo">
                      {trade.memo || "-"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="trade-delete-button"
                        onClick={() =>
                          handleDelete(trade.id)
                        }
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
