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
import {
  ZATLIN_VERSION,
  Zatlin
} from "zatlin";
import Button from "/client/component/atom/button";
import Input from "/client/component/atom/input";
import Overlay from "/client/component/atom/overlay";
import TextArea from "/client/component/atom/text-area";
import {
  create
} from "/client/component/create";
import {
  useTrans
} from "/client/component/hook";


const ZatlinExecutor = create(
  require("./zatlin-executor.scss"), "ZatlinExecutor",
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
    const [output, setOutput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const {trans} = useTrans("zatlinExecutor");

    const executeZatlin = useCallback(function (): void {
      try {
        const zatlin = Zatlin.load(source);
        const output = zatlin.generate();
        setOutput(output);
        setErrorMessage("");
      } catch (error) {
        const errorMessage = error.message.trim() ?? "Unknown error";
        setOutput("");
        setErrorMessage(errorMessage);
      }
    }, [source]);

    const handleClose = useCallback(function (event: MouseEvent<HTMLElement>): void {
      onClose?.(event, source);
    }, [onClose, source]);

    useEffect(() => {
      setSource(defaultSource ?? "");
    }, [defaultSource]);

    const version = ZATLIN_VERSION;
    const node = (
      <Overlay size="large" title={trans("title", {version})} open={open} onClose={handleClose}>
        <div styleName="root">
          <TextArea
            styleName="source"
            label={trans("source")}
            value={source}
            font="monospace"
            language="zatlin"
            nowrap={true}
            fitHeight={true}
            onSet={(source) => setSource(source)}
          />
          <Button styleName="button" label={trans("execute")} onClick={executeZatlin}/>
          <Input label={trans("output")} value={output} readOnly={true}/>
          <TextArea
            styleName="error-message"
            label={trans("errorMessage")}
            value={errorMessage}
            font="monospace"
            language="plain"
            nowrap={true}
            readOnly={true}
            fitHeight={true}
          />
        </div>
      </Overlay>
    );
    return node;

  }
);


export default ZatlinExecutor;