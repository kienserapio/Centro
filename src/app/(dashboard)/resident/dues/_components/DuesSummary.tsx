interface Props {
  nextDueDate: string;
  balance: string;
}

export function DuesSummary({ nextDueDate, balance }: Props) {
  const cards = [
    {
      label: "Next Due Date",
      value: nextDueDate,
      icon: "event",
      accentClass: "text-[#111827]",
      iconBgClass: "bg-primary/10",
      iconColorClass: "text-primary",
      borderClass: "border-l-4 border-primary",
    },
    {
      label: "Current Balance",
      value: balance,
      icon: "account_balance_wallet",
      accentClass: "text-secondary",
      iconBgClass: "bg-secondary/10",
      iconColorClass: "text-secondary",
      borderClass: "border-l-4 border-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] ${card.borderClass}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <h3 className={`text-4xl font-bold ${card.accentClass}`}>
                {card.value}
              </h3>
            </div>
            <div className={`${card.iconBgClass} p-2.5 rounded-lg`}>
              <span className={`material-icons-round ${card.iconColorClass}`}>
                {card.icon}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
