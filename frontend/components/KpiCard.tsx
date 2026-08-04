type Props = {
  title: string;
  value: string;
  sub: string;
  positive?: boolean;
};

export default function KpiCard({
  title,
  value,
  sub,
  positive = true,
}: Props) {
  return (
    <div className="kpi-card">

      <span className="kpi-title">{title}</span>

      <h2>{value}</h2>

      <p className={positive ? "green" : "red"}>
        {sub}
      </p>

    </div>
  );
}
