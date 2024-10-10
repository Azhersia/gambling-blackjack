type RandomCardProps = {
  card: string;
};

export default function RandomCard({ card }: RandomCardProps) {
  return (
    <div>
      <div>{card}</div>
    </div>
  );
}
