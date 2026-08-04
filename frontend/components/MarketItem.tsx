type Props = {
  name: string;
  value: string;
  change: string;
  positive?: boolean;
};

export default function MarketItem({
  name,
  value,
  change,
  positive = true,
}: Props) {
  return (
    <div className="market-item">

      <div>

        <span>{name}</span>

        <h2>{value}</h2>

      </div>

      <h3 className={positive ? "green" : "red"}>
        {change}
      </h3>

    </div>
  );
}
