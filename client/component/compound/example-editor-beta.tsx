//

import cloneDeep from "lodash-es/cloneDeep";
import {
  nanoid
} from "nanoid";
import * as react from "react";
import {
  Dispatch,
  Fragment,
  MouseEvent,
  ReactElement,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  AsyncOrSync
} from "ts-essentials";
import Alert from "/client/component/atom/alert";
import Button from "/client/component/atom/button";
import ControlGroup from "/client/component/atom/control-group";
import Icon from "/client/component/atom/icon";
import Input from "/client/component/atom/input";
import Label from "/client/component/atom/label";
import Overlay from "/client/component/atom/overlay";
import TextArea from "/client/component/atom/text-area";
import WordSearcher from "/client/component/compound/word-searcher";
import {
  StylesRecord,
  create
} from "/client/component/create";
import {
  useDragDrop,
  useIntl,
  usePopup,
  useRequest,
  useStateWithCallback
} from "/client/component/hook";
import {
  EditableExample,
  EnhancedDictionary,
  Example,
  LinkedWord,
  Word
} from "/client/skeleton/dictionary";
import {
  deleteAt,
  moveAt
} from "/client/util/misc";
import {
  StyleNameUtil
} from "/client/util/style-name";


const ExampleEditor = create(
  require("./example-editor-beta.scss"), "ExampleEditor",
  function ({
    dictionary,
    example,
    onEditConfirm,
    onDiscardConfirm,
    onCancel
  }: {
    dictionary: EnhancedDictionary,
    example: Example | null,
    onEditConfirm?: (example: EditableExample, event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>,
    onDiscardConfirm?: (event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>,
    onCancel?: (event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>
  }): ReactElement {

    let [tempExample, setTempExample] = useStateWithCallback(createTempExample(example));
    let [wordChooserOpen, setWordChooserOpen] = useState(false);
    let [alertOpen, setAlertOpen] = useState(false);
    let editingWordIndexRef = useRef<number>();
    let [, {trans}] = useIntl();
    let {request} = useRequest();
    let [, {addInformationPopup}] = usePopup();

    let mutateExample = useCallback(function <T extends Array<unknown>>(setter: (tempExample: EditableExample, ...args: T) => void): (...args: T) => void {
      let wrapper = function (...args: T): void {
        setTempExample((tempExample) => {
          setter(tempExample, ...args);
          return {...tempExample};
        });
      };
      return wrapper;
    }, [setTempExample]);

    let openWordChooser = useCallback(function (index: number): void {
      editingWordIndexRef.current = index;
      setWordChooserOpen(true);
    }, []);

    let editWord = useCallback(function (word: Word): void {
      setTempExample((tempExample) => {
        let wordIndex = editingWordIndexRef.current!;
        if (tempExample.words[wordIndex] === undefined) {
          tempExample.words[wordIndex] = {...LinkedWord.createEmpty(), tempId: nanoid()};
        }
        tempExample.words[wordIndex].number = word.number;
        tempExample.words[wordIndex].name = word.name;
        return {...tempExample};
      });
      setWordChooserOpen(false);
    }, [setTempExample]);

    let editExample = useCallback(async function (event: MouseEvent<HTMLButtonElement>): Promise<void> {
      let number = dictionary.number;
      let response = await request("editExample", {number, example: tempExample});
      if (response.status === 200) {
        addInformationPopup("exampleEdited");
        await onEditConfirm?.(tempExample, event);
      }
    }, [dictionary, tempExample, request, onEditConfirm, addInformationPopup]);

    let discardExample = useCallback(async function (event: MouseEvent<HTMLButtonElement>): Promise<void> {
      let number = dictionary.number;
      let exampleNumber = tempExample.number;
      if (exampleNumber !== undefined) {
        let response = await request("discardExample", {number, exampleNumber});
        if (response.status === 200) {
          addInformationPopup("exampleDiscarded");
          await onDiscardConfirm?.(event);
        }
      }
    }, [dictionary, tempExample, request, onDiscardConfirm, addInformationPopup]);

    let fetchWordNames = useCallback(async function (): Promise<void> {
      let number = dictionary.number;
      let wordNumbers = tempExample.words.map((word) => word.number);
      let response = await request("fetchWordNames", {number, wordNumbers}, {ignoreError: true});
      if (response.status === 200 && !("error" in response.data)) {
        let names = response.data.names;
        mutateExample((tempExample) => {
          for (let word of tempExample.words) {
            word.name = names[word.number] ?? undefined;
          }
        })();
      }
    }, [dictionary.number, tempExample, request, mutateExample]);

    useEffect(() => {
      let tempExample = createTempExample(example);
      setTempExample(tempExample, () => {
        fetchWordNames();
      });
    }, [example]);

    let editorProps = {dictionary, example, tempExample, mutateExample, openWordChooser, onCancel, editExample, setAlertOpen};
    let node = (
      <Fragment>
        <ExampleEditorRoot {...editorProps}/>
        <Overlay size="large" title={trans("wordSearcher.title")} open={wordChooserOpen} onClose={() => setWordChooserOpen(false)}>
          <WordSearcher dictionary={dictionary} style="simple" showButton={true} onSubmit={editWord}/>
        </Overlay>
        <Alert
          text={trans("exampleEditor.alert")}
          confirmLabel={trans("exampleEditor.alertConfirm")}
          open={alertOpen}
          outsideClosable={true}
          onClose={() => setAlertOpen(false)}
          onConfirm={discardExample}
        />
      </Fragment>
    );
    return node;

  }
);


const ExampleEditorRoot = create(
  require("./example-editor-beta.scss"),
  function ({
    dictionary,
    example,
    tempExample,
    mutateExample,
    openWordChooser,
    onCancel,
    editExample,
    setAlertOpen
  }: {
    dictionary: EnhancedDictionary,
    example: Example | null,
    tempExample: TempEditableExample,
    mutateExample: MutateExampleCallback,
    openWordChooser: (index: number) => void,
    onCancel?: (event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>,
    editExample: (event: MouseEvent<HTMLButtonElement>) => Promise<void>,
    setAlertOpen: Dispatch<SetStateAction<boolean>>
  }): ReactElement {

    let [mainShown, setMainShown] = useState(true);
    let [, {trans}] = useIntl();

    let cancelButtonNode = (
      <Button label={trans("wordEditor.cancel")} iconName="times" onClick={onCancel}/>
    );
    let discardButtonNode = (example !== null) && (
      <Button label={trans("exampleEditor.discard")} iconName="trash-alt" style="caution" reactive={true} onClick={() => setAlertOpen(true)}/>
    );
    let confirmButtonNode = (
      <Button label={trans("exampleEditor.confirm")} iconName="check" style="information" reactive={true} onClick={editExample}/>
    );
    let mainStyleName = StyleNameUtil.create(
      "main",
      {if: mainShown, false: "hidden"}
    );
    let headName = (example !== null) ? trans("exampleEditor.existingExample", {number: example.number.toString()}) : trans("exampleEditor.newExample");
    let innerProps = {dictionary, tempExample, mutateExample};
    let node = (
      <div styleName="root">
        <div styleName="head-name" onClick={() => setMainShown((mainShown) => !mainShown)}>
          <span styleName="head-icon"><Icon name={(mainShown) ? "circle-chevron-down" : "circle-chevron-right"}/></span>
          {headName}
        </div>
        <div styleName={mainStyleName}>
          <div styleName="editor">
            <ExampleEditorSentence {...innerProps}/>
            <ExampleEditorWords {...innerProps} {...{openWordChooser}}/>
          </div>
          <div styleName="confirm-button-wrapper">
            <div/>
            <div styleName="confirm-button">
              {cancelButtonNode}
              {discardButtonNode}
              {confirmButtonNode}
            </div>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const ExampleEditorSentence = create(
  require("./example-editor-beta.scss"),
  function ({
    dictionary,
    tempExample,
    mutateExample,
    styles
  }: {
    dictionary: EnhancedDictionary,
    tempExample: TempEditableExample,
    mutateExample: MutateExampleCallback,
    styles?: StylesRecord
  }): ReactElement {

    let [, {trans}] = useIntl();

    let node = (
      <div styleName="container">
        <div styleName="head">
          {trans("wordEditor.basic")}
        </div>
        <div styleName="container-inner">
          <div styleName="container-item">
            <div styleName="form-wrapper">
              <div styleName="form sentence">
                <label>
                  <Label text={trans("exampleEditor.sentence")} position="left"/>
                  <TextArea className={styles!["text"]} value={tempExample.sentence} onSet={mutateExample((tempExample, sentence) => tempExample.sentence = sentence)}/>
                </label>
                <label>
                  <Label text={trans("exampleEditor.translation")} position="left"/>
                  <TextArea className={styles!["text"]} value={tempExample.translation} onSet={mutateExample((tempExample, translation) => tempExample.translation = translation)}/>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const ExampleEditorWords = create(
  require("./example-editor-beta.scss"),
  function ({
    dictionary,
    tempExample,
    mutateExample,
    openWordChooser
  }: {
    dictionary: EnhancedDictionary,
    tempExample: TempEditableExample,
    mutateExample: MutateExampleCallback,
    openWordChooser: (index: number) => void
  }): ReactElement {

    let [, {trans}] = useIntl();

    let innerNodes = tempExample.words.map((word, index) => <ExampleEditorWord key={word.tempId} {...{dictionary, tempExample, word, index, mutateExample, openWordChooser}}/>);
    let plusNode = (() => {
      let absentMessage = (tempExample.words.length <= 0) ? trans("exampleEditor.wordAbsent") : "";
      let plusNode = (
        <div styleName="plus">
          <div styleName="absent">{absentMessage}</div>
          <div styleName="plus-button">
            <Button label={trans("exampleEditor.add")} iconName="plus" onClick={() => openWordChooser(tempExample.words.length)}/>
          </div>
        </div>
      );
      return plusNode;
    })();
    let node = (
      <div styleName="container">
        <div styleName="head">
          {trans("exampleEditor.word")}
        </div>
        <div styleName="container-inner">
          {innerNodes}
          {plusNode}
        </div>
      </div>
    );
    return node;

  }
);


const ExampleEditorWord = create(
  require("./example-editor-beta.scss"),
  function ({
    dictionary,
    tempExample,
    word,
    index,
    mutateExample,
    openWordChooser,
    styles
  }: {
    dictionary: EnhancedDictionary,
    tempExample: TempEditableExample,
    word: LinkedWord,
    index: number,
    mutateExample: MutateExampleCallback,
    openWordChooser: (index: number) => void,
    styles?: StylesRecord
  }): ReactElement {

    let [, {trans}] = useIntl();
    let [rootRef, handleRef, dragging] = useDragDrop(
      `example-word-${dictionary.id}-${tempExample.tempId}`,
      index,
      mutateExample((tempExample, draggingIndex, hoverIndex) => moveAt(tempExample.words, draggingIndex, hoverIndex))
    );

    let styleName = StyleNameUtil.create(
      "container-item",
      {if: dragging, true: "dragging"}
    );
    let node = (
      <div styleName={styleName} ref={rootRef}>
        <div styleName="handle" ref={handleRef}>
          <div styleName="handle-icon"><Icon name="grip-vertical"/></div>
        </div>
        <div styleName="form-wrapper">
          <div styleName="form">
            <div/>
            <ControlGroup className={StyleNameUtil.create(styles!["name"], styles!["word-input"])}>
              <Input value={word.name ?? trans("exampleEditor.wordNameUndefined")} readOnly={true}/>
              <Button label={trans("exampleEditor.selectWord")} onClick={() => openWordChooser(index)}/>
            </ControlGroup>
          </div>
          <div styleName="control-button">
            <Button iconName="minus" onClick={mutateExample((tempExample) => deleteAt(tempExample.words, index))}/>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


function createTempExample(example: EditableExample | null): TempEditableExample {
  let tempExample = cloneDeep(example) ?? EditableExample.createEmpty();
  let tempId = nanoid();
  let words = tempExample.words.map((word) => ({...word, tempId: nanoid()}));
  return {...tempExample, tempId, words};
}

type TempEditableExample = Omit<EditableExample, "words"> & {tempId: string, words: Array<TempLinkedWord>};
type TempLinkedWord = LinkedWord & {tempId: string};

export type MutateExampleCallback = <T extends Array<unknown>>(setter: (tempExample: EditableExample, ...args: T) => void) => (...args: T) => void;

export default ExampleEditor;