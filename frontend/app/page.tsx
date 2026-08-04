import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import KpiCard from "@/components/KpiCard";
import ProgressCard from "@/components/ProgressCard";
import AiSummary from "@/components/AiSummary";
import TodoCard from "@/components/TodoCard";
import TradeHistory from "@/components/TradeHistory";

export default function Home() {
  return (
    <main className="app">

      <Sidebar />

      <section className="content">

        <Header />

        <div className="dashboard">

          <KpiCard
            title="총 자산"
            value="₩15,430,000"
            sub="+231,400 (+1.52%)"
          />

          <KpiCard
            title="오늘 수익"
            value="+₩82,300"
            sub="+0.54%"
          />

          <KpiCard
            title="AI Score"
            value="92점"
            sub="★★★★★"
          />

          <KpiCard
            title="시장 상태"
            value="BULL"
            sub="Risk ON"
          />

        </div>

        <div className="grid2">

          <ProgressCard
            title="목표 달성률"
            percent={31}
          />

          <ProgressCard
            title="오늘 목표"
            percent={47}
          />

        </div>

        <div className="market">

          <div className="card">

            <h2>SOXL</h2>

            <h1 className="green">+4.31%</h1>

          </div>

          <div className="card">

            <h2>SOXS</h2>

            <h1 className="red">-3.12%</h1>

          </div>

          <div className="card">

            <h2>VIX</h2>

            <h1>17.48</h1>

          </div>

          <div className="card">

            <h2>Nasdaq Futures</h2>

            <h1 className="green">
              +0.72%
            </h1>

          </div>

        </div>

    <div className="grid2">

      <AiSummary />

      <TodoCard />

    </div>

    <div style={{ marginTop: 30 }}>

      <TradeHistory />

    </div>

      </section>

    </main>
  );
}
