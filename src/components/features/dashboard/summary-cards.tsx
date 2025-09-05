import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { IconType } from "react-icons/lib";

export type SummaryCardProps = {
  id: string;
  title: string;
  value: string | number;
  delta: number;
  period?: string;
  icon?: IconType;
  iconBgColor?: string;
};

export function SummaryCard({
  id,
  title,
  value,
  delta,
  period = "This Year",
  icon: Icon,
  iconBgColor = "bg-gray-200",
}: SummaryCardProps) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  // Count-up setup (only for numeric values)
  const isNumber = typeof value === "number" || !isNaN(Number(value));
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.floor(latest).toLocaleString());

  useEffect(() => {
    if (inView && isNumber) {
      const controls = animate(count, Number(value), {
        duration: 1.2,
        ease: "easeOut",
      });
      return () => controls.stop();
    }
  }, [inView, isNumber, value]);

  return (
    <motion.div
      key={id}
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-5 justify-between items-center flex gap-3 sm:gap-4 hover:shadow-md transition-shadow"
    >
      {/* Icon */}
      <div className="flex gap-3 sm:gap-4">
        <div className={`${iconBgColor} w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-white text-lg`}>
         { Icon && <Icon size={20}/>}
        </div>

        <div className="flex flex-col">
          {/* Title */}
          <h3 className="text-sm sm:text-base text-gray-500 font-medium">{title}</h3>

          {/* Value */}
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {isNumber ? <motion.span>{rounded}</motion.span> : value}
          </div>
        </div>
      </div>

      {/* Delta + Period */}
      {period && <div className="text-sm">
        <p
          className={`font-medium text-center ${isPositive
            ? "text-emerald-500"
            : isNegative
              ? "text-rose-500"
              : "text-gray-500"
            }`}
        >
          {isPositive ? "↑" : isNegative ? "↓" : "→"}{" "}
          {Math.abs(delta).toFixed(2)}%
        </p>
        <p className="text-gray-500 text-center min-w-20 mt-1">{period}</p>
      </div>}
    </motion.div>
  );
}