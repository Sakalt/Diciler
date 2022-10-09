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
  invalidateQueries,
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
import {DataUtil} from "/client/util/data";
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
    onEditConfirm?: (example: EditableExample, event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<unknown>,
    onDiscardConfirm?: (event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<unknown>,
    onCancel?: (event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>
  }): ReactElement {

    const [tempExample, setTempExample] = useStateWithCallback(createTempExample(example));
    const [wordChooserOpen, setWordChooserOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const editingWordIndexRef = useRef<number>();
    const [, {trans}] = useIntl();
    const {request} = useRequest();
    const [, {addInformationPopup}] = usePopup();

    const mutateExample = useCallback(function <T extends Array<unknown>>(setter: (tempExample: EditableExample, ...args: T) => void): (...args: T) => void {
      const wrapper = function (...args: T): void {
        setTempExample((tempExample) => {
          setter(tempExample, ...args);
          return {...tempExample};
        });
      };
      return wrapper;
    }, [setTempExample]);

    const openWordChooser = useCallback(function (index: number): void {
      editingWordIndexRef.current = index;
      setWordChooserOpen(true);
    }, []);

    const editWord = useCallback(function (word: Word): void {
      setTempExample((tempExample) => {
        const wordIndex = editingWordIndexRef.current!;
        if (tempExample.words[wordIndex] === undefined) {
          tempExample.words[wordIndex] = {...LinkedWord.createEmpty(), tempId: nanoid()};
        }
        tempExample.words[wordIndex].number = word.number;
        tempExample.words[wordIndex].name = word.name;
        return {...tempExample};
      });
      setWordChooserOpen(false);
    }, [setTempExample]);

    const editExample = useCallback(async function (event: MouseEvent<HTMLButtonElement>): Promise<void> {
      const number = dictionary.number;
      const response = await request("editExample", {number, example: tempExample});
      if (response.status === 200) {
        addInformationPopup("exampleEdited");
        await onEditConfirm?.(tempExample, event);
        await invalidateQueries("fetchExamples", (data) => data.number === number);
      }
    }, [dictionary, tempExample, request, onEditConfirm, addInformationPopup]);

    const discardExample = useCallback(async function (event: MouseEvent<HTMLButtonElement>): Promise<void> {
      const number = dictionary.number;
      const exampleNumber = tempExample.number;
      if (exampleNumber !== undefined) {
        const response = await request("discardExample", {number, exampleNumber});
        if (response.status === 200) {
          addInformationPopup("exampleDiscarded");
          await onDiscardConfirm?.(event);
          await invalidateQueries("fetchExamples", (data) => data.number === number);
        }
      }
    }, [dictionary, tempExample, request, onDiscardConfirm, addInformationPopup]);

    const fetchWordNames = useCallback(async function (): Promise<void> {
      const number = dictionary.number;
      const wordNumbers = tempExample.words.map((word) => word.number);
      const response = await request("fetchWordNames", {number, wordNumbers}, {ignoreError: true});
      if (response.status === 200 && !("error" in response.data)) {
        const names = response.data.names;
        mutateExample((tempExample) => {
          for (const word of tempExample.words) {
            word.name = names[word.number] ?? undefined;
          }
        })();
      }
    }, [dictionary.number, tempExample, request, mutateExample]);

    useEffect(() => {
      const tempExample = createTempExample(example);
      setTempExample(tempExample, () => {
        fetchWordNames();
      });
    }, [example]);

    const editorProps = {dictionary, example, tempExample, mutateExample, openWordChooser, onCancel, editExample, setAlertOpen};
    const node = (
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

    const [mainShown, setMainShown] = useState(true);
    const [, {trans}] = useIntl();


    const headName = (example !== null) ? trans("exampleEditor.existingExample", {number: example.number.toString()}) : trans("exampleEditor.newExample");
    const innerProps = {dictionary, tempExample, mutateExample};
    const mainData = DataUtil.create({
      hidden: !mainShown
    });
    const node = (
      <div styleName="root">
        <div styleName="head-name" onClick={() => setMainShown((mainShown) => !mainShown)}>
          <span styleName="head-icon"><Icon name={(mainShown) ? "circle-chevron-down" : "circle-chevron-right"}/></span>
          {headName}
        </div>
        <div styleName="main" {...mainData}>
          <div styleName="editor">
            <ExampleEditorSentence {...innerProps}/>
            <ExampleEditorWords {...innerProps} {...{openWordChooser}}/>
          </div>
          <div styleName="footer">
            <div/>
            <div styleName="confirm-button-container">
              <Button label={trans("wordEditor.cancel")} iconName="times" variant="light" onClick={onCancel}/>
              {(example !== null) && (
                <Button label={trans("exampleEditor.discard")} iconName="trash-alt" scheme="red" reactive={true} onClick={() => setAlertOpen(true)}/>
              )}
              <Button label={trans("exampleEditor.confirm")} iconName="check" scheme="blue" reactive={true} onClick={editExample}/>
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

    const [, {trans}] = useIntl();

    const node = (
      <div styleName="section">
        <div styleName="head">
          {trans("wordEditor.basic")}
        </div>
        <div styleName="section-content">
          <div styleName="section-item">
            <div styleName="form-container">
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

    const [, {trans}] = useIntl();

    const node = (
      <div styleName="section">
        <div styleName="head">
          {trans("exampleEditor.word")}
        </div>
        <div styleName="section-content">
          {tempExample.words.map((word, index) => (
            <ExampleEditorWord key={word.tempId} {...{dictionary, tempExample, word, index, mutateExample, openWordChooser}}/>
          ))}
          <div styleName="plus">
            <div styleName="absent">{(tempExample.words.length <= 0) ? trans("exampleEditor.wordAbsent") : ""}</div>
            <div styleName="plus-button-container">
              <Button iconName="plus" variant="light" onClick={() => openWordChooser(tempExample.words.length)}/>
            </div>
          </div>
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

    const [, {trans}] = useIntl();
    const [rootRef, handleRef, dragging] = useDragDrop(
      `example-word-${dictionary.id}-${tempExample.tempId}`,
      index,
      mutateExample((tempExample, draggingIndex, hoverIndex) => moveAt(tempExample.words, draggingIndex, hoverIndex))
    );

    const data = DataUtil.create({
      dragging
    });
    const node = (
      <div styleName="section-item" ref={rootRef} {...data}>
        <div styleName="handle" ref={handleRef}>
          <div styleName="handle-icon"><Icon name="grip-vertical"/></div>
        </div>
        <div styleName="form-container">
          <div styleName="form">
            <div/>
            <ControlGroup className={StyleNameUtil.create(styles!["name"], styles!["word-input"])}>
              <Input value={word.name ?? trans("exampleEditor.wordNameUndefined")} readOnly={true}/>
              <Button label={trans("exampleEditor.selectWord")} variant="light" onClick={() => openWordChooser(index)}/>
            </ControlGroup>
          </div>
          <div styleName="control-button">
            <Button iconName="minus" variant="light" onClick={mutateExample((tempExample) => deleteAt(tempExample.words, index))}/>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


function createTempExample(example: EditableExample | null): TempEditableExample {
  const tempExample = cloneDeep(example) ?? EditableExample.createEmpty();
  const tempId = nanoid();
  const words = tempExample.words.map((word) => ({...word, tempId: nanoid()}));
  return {...tempExample, tempId, words};
}

type TempEditableExample = Omit<EditableExample, "words"> & {tempId: string, words: Array<TempLinkedWord>};
type TempLinkedWord = LinkedWord & {tempId: string};

export type MutateExampleCallback = <T extends Array<unknown>>(setter: (tempExample: EditableExample, ...args: T) => void) => (...args: T) => void;

export default ExampleEditor;