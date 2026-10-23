import CountUpImport from 'react-countup';

/** Vite 8 下 CJS 默认导出有时会多包一层 default。 */
const CountUp = (CountUpImport as { default?: typeof CountUpImport }).default ?? CountUpImport;

export default CountUp;
