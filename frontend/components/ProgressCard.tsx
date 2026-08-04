type Props = {
  title: string;
  percent: number;
};

export default function ProgressCard({
  title,
  percent,
}: Props) {
  return (
    <div className="card">

      <h3>{title}</h3>

      <div className="progress">

        <div
          className="progress-bar"
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

      <h2>{percent}%</h2>

    </div>
  );
}
