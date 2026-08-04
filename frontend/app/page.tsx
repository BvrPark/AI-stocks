import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="app">

      <Sidebar />

      <section className="content">

        <Header />

        <div className="dashboard">

          <div className="card">
            <h3>총 자산</h3>
            <h1>₩15,430,000</h1>
            <p className="green">+231,400 (+1.52%)</p>
          </div>

          <div className="card">
            <h3>오늘 목표</h3>
            <h1>₩82,000</h1>
            <p>달성률 43%</p>
          </div>

          <div className="card">
            <h3>AI Score</h3>
            <h1>92점</h1>
            <p className="green">★★★★★ SOXL 적극매수</p>
          </div>

          <div className="card">
            <h3>시장 상태</h3>
            <h1>BULL</h1>
            <p>Risk ON</p>
          </div>

        </div>

      </section>

    </main>
  );
}
