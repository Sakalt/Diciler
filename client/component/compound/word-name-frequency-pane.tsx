//

import {
  ReactElement
} from "react";
import Chart from "/client/component/atom/chart";
import {
  ChartConfig,
  ChartData
} from "/client/component/atom/chart";
import {
  StylesRecord,
  create
} from "/client/component/create";
import {
  useIntl,
  useSuspenseQuery
} from "/client/component/hook";
import {
  DetailedDictionary,
  WordNameFrequencies
} from "/client/skeleton/dictionary";


const WordNameFrequencyPane = create(
  require("./word-name-frequency-pane.scss"), "WordNameFrequencyPane",
  function ({
    dictionary,
    styles
  }: {
    dictionary: DetailedDictionary,
    styles?: StylesRecord
  }): ReactElement {

    const [, {trans}] = useIntl();

    const number = dictionary.number;
    const [frequencies] = useSuspenseQuery("fetchWordNameFrequencies", {number});

    const {data} = calcChartSpec(frequencies, trans("wordNameFrequencyPane.others"));
    const config = {
      padding: {top: 0, bottom: 0, left: 0, right: 0},
      legend: {show: true},
      customTooltip: {
        format: {
          value: (value, total) => trans("wordNameFrequencyPane.value", {value, total}),
          percent: (percent) => trans("wordNameFrequencyPane.percent", {percent})
        }
      }
    } as ChartConfig;
    const node = (
      <div styleName="root">
        <Chart className={styles!["chart"]} data={data} config={config}/>
      </div>
    );
    return node;

  }
);


function calcChartSpec(frequencies: WordNameFrequencies, othersString: string): {data: ChartData} {
  const rawColumns = frequencies.char.map(([char, frequency]) => [char, frequency.all] as const);
  rawColumns.sort((firstColumn, secondColumn) => secondColumn[1] - firstColumn[1]);
  const formerColumns = rawColumns.slice(0, 20);
  const otherColumns = (rawColumns.length > 20) ? [[othersString, rawColumns.slice(20, -1).reduce((sum, column) => sum + column[1], 0)]] : [];
  const columns = [...formerColumns, ...otherColumns];
  const colors = Object.fromEntries([[othersString, "var(--accent-color)"]]);
  const data = {columns, colors, type: "pie", order: null} as ChartData;
  return {data};
}

export default WordNameFrequencyPane;