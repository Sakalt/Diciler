//

import {
  ReactElement,
  useMemo
} from "react";
import Chart from "/client/component/atom/chart";
import {
  ChartConfig,
  ChartData
} from "/client/component/atom/chart";
import {
  create
} from "/client/component/create";
import {
  useSuspenseQuery,
  useTrans
} from "/client/component/hook";
import {
  DetailedDictionary
} from "/client/skeleton/dictionary";
import {
  History
} from "/client/skeleton/history";


const HistoryPane = create(
  require("./history-pane.scss"), "HistoryPane",
  function ({
    dictionary
  }: {
    dictionary: DetailedDictionary
  }): ReactElement {

    const {transNumber, transShortDate} = useTrans("historyPane");

    const number = dictionary.number;
    const from = useMemo(() => new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toString(), []);
    const [wordSize] = useSuspenseQuery("fetchWordSize", {number});
    const [histories] = useSuspenseQuery("fetchHistories", {number, from});

    const {data, maxAxis, minAxis} = calcChartSpec(histories, wordSize);
    const padding = 24 * 60 * 60 * 1000;
    const config = {
      padding: {left: 45},
      axis: {
        x: {tick: {format: transShortDate}, padding: {left: padding, right: padding}, type: "timeseries"},
        y: {tick: {format: transNumber}, max: maxAxis, min: minAxis, padding: {top: 0, bottom: 0}}
      }
    } as ChartConfig;
    const node = (
      <div styleName="root">
        <Chart styleName="chart" data={data} config={config}/>
      </div>
    );
    return node;

  }
);


function calcChartSpec(histories: Array<History>, wordSize: number): {data: ChartData, maxAxis: number, minAxis: number} {
  const dates = [...histories.map((history) => new Date(history.date)), new Date()];
  const wordSizes = [...histories.map((history) => history.wordSize), wordSize];
  const maxWordSize = Math.max(...wordSizes);
  const minWordSize = Math.min(...wordSizes);
  const maxAxis = maxWordSize + Math.max((maxWordSize - minWordSize) * 0.05, 10);
  const minAxis = Math.max(minWordSize - Math.max((maxWordSize - minWordSize) * 0.05, 10), 0);
  const data = {x: "date", columns: [["date", ...dates], ["wordSize", ...wordSizes]], types: {wordSize: "area"}} as ChartData;
  return {data, maxAxis, minAxis};
}

export default HistoryPane;