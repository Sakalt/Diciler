//

import {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from "react";
import {
  AsyncOrSync
} from "ts-essentials";
import Button from "/client/component/atom/button";
import Label from "/client/component/atom/label";
import Overlay from "/client/component/atom/overlay";
import TextArea from "/client/component/atom/text-area";
import {
  create
} from "/client/component/create";
import {
  useTrans
} from "/client/component/hook";
import {
  RegexpExecResult,
  RegexpUtil
} from "/client/util/regexp";


const RegexpExecutor = create(
  require("./regexp-executor.scss"), "RegexpExecutor",
  function ({
    defaultSource,
    open,
    onClose
  }: {
    defaultSource?: string,
    open: boolean,
    onClose?: (event: MouseEvent<HTMLElement>, source: string) => AsyncOrSync<void>
  }): ReactElement {

    const [source, setSource] = useState(defaultSource ?? "");
    const [target, setTarget] = useState("");
    const [result, setResult] = useState<RegexpExecResult | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const {trans} = useTrans("regexpExecutor");

    const executeRegexp = useCallback(function (): void {
      try {
        const result = RegexpUtil.exec(source, target);
        setResult(result);
        setErrorMessage("");
      } catch (error) {
        const errorMessage = error.message.trim() ?? "Unknown error";
        setResult(null);
        setErrorMessage(errorMessage);
      }
    }, [source, target]);

    const handleClose = useCallback(function (event: MouseEvent<HTMLElement>): void {
      onClose?.(event, source);
    }, [onClose, source]);

    useEffect(() => {
      setSource(defaultSource ?? "");
    }, [defaultSource]);

    const node = (
      <Overlay size="large" title={trans("title")} open={open} onClose={handleClose}>
        <div styleName="root">
          <TextArea
            styleName="source"
            label={trans("source")}
            value={source}
            font="monospace"
            language="regexp"
            nowrap={true}
            fitHeight={true}
            onSet={(source) => setSource(source)}
          />
          <TextArea
            styleName="target"
            label={trans("target")}
            value={target}
            font="monospace"
            language="plain"
            nowrap={true}
            fitHeight={true}
            onSet={(target) => setTarget(target)}
          />
          <Button styleName="button" label={trans("execute")} onClick={executeRegexp}/>
          <RegexpExecutorResult {...{result, errorMessage}}/>
        </div>
      </Overlay>
    );
    return node;

  }
);


const RegexpExecutorResult = create(
  require("./regexp-executor.scss"),
  function ({
    result,
    errorMessage
  }: {
    result: RegexpExecResult | null,
    errorMessage: string
  }): ReactElement {

    const {trans} = useTrans("regexpExecutor");

    const innerNodes = [];
    if (result !== null) {
      const target = result.target;
      const length = result.matches.length;
      let currentIndex = 0;
      innerNodes.push((length > 0) ? "matched" : "not matched");
      if (result.matches.length > 0) {
        innerNodes.push((length === 1) ? ` (${length} match):\n` : ` (${length} matches):\n`);
        innerNodes.push("  ");
        for (let index = 0 ; index < result.matches.length ; index ++) {
          const range = result.matches[index].range;
          const rangeNode = (
            <span styleName="hit" key={index}>
              {target.substring(range.start, range.end).replaceAll("\n", "\n  ")}
            </span>
          );
          innerNodes.push(target.substring(currentIndex, range.start).replaceAll("\n", "\n  "));
          innerNodes.push(rangeNode);
          currentIndex = range.end;
        }
        innerNodes.push(target.substring(currentIndex, target.length).replace("\n", "\n  "));
      }
    } else {
      innerNodes.push(errorMessage);
    }
    const node = (
      <div styleName="error-message">
        <Label text={trans("result")}/>
        <div styleName="result-input">
          {innerNodes}
        </div>
      </div>
    );
    return node;

  }
);


export default RegexpExecutor;