interface PercentTextProps {
  value: number;
  className?: string;
  /** 紧跟在百分号后面，例如「较去年」 */
  suffix?: string;
}

const PercentText = (props: PercentTextProps) => {
  const { value, className = '', suffix = '' } = props;
  const tone = value > 0 ? 'text-[var(--hooks-chartPositive)]' : 'text-[var(--hooks-chartNegative)]';

  return (
    <span className={`font-medium ${tone}  ${className}`}>
      {value > 0 ? '+' : ''}
      {value}%{suffix}
    </span>
  );
};

export default PercentText;
