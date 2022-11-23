//

import cloneDeep from "lodash-es/cloneDeep";
import {
  nanoid
} from "nanoid";
import {
  Dispatch,
  Fragment,
  MouseEvent,
  ReactElement,
  SetStateAction,
  Suspense,
  useCallback,
  useRef,
  useState
} from "react";
import {
  AsyncOrSync
} from "ts-essentials";
import {
  Zatlin
} from "zatlin";
import Alert from "/client/component/atom/alert";
import Button from "/client/component/atom/button";
import ControlGroup from "/client/component/atom/control-group";
import Icon from "/client/component/atom/icon";
import Input from "/client/component/atom/input";
import {
  Suggest,
  SuggestionSpec,
  ValidationSpec
} from "/client/component/atom/input";
import MultiInput from "/client/component/atom/multi-input";
import Overlay from "/client/component/atom/overlay";
import TextArea from "/client/component/atom/text-area";
import Loading from "/client/component/compound/loading";
import ResourceList from "/client/component/compound/resource-list";
import WordSearcher from "/client/component/compound/word-searcher";
import {
  create
} from "/client/component/create";
import {
  invalidateQueries,
  useDragDrop,
  usePopup,
  useRequest,
  useTrans
} from "/client/component/hook";
import {
  EditableWord,
  EnhancedDictionary,
  Equivalent,
  Information,
  Relation,
  Variation,
  Word
} from "/client/skeleton/dictionary";
import {
  data
} from "/client/util/data";
import {
  deleteAt,
  moveAt
} from "/client/util/misc";


export const WordEditor = create(
  require("./word-editor.scss"), "WordEditor",
  function ({
    dictionary,
    word,
    defaultName,
    defaultEquivalentName,
    onTempSet,
    onEditConfirm,
    onDiscardConfirm,
    onCancel
  }: {
    dictionary: EnhancedDictionary,
    word: Word | null,
    defaultName?: string,
    defaultEquivalentName?: string,
    onTempSet?: (tempWord: TempEditableWord) => void,
    onEditConfirm?: (word: EditableWord, event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>,
    onDiscardConfirm?: (event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>,
    onCancel?: (event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>
  }): ReactElement {

    const [tempWord, setTempWord] = useState(createTempWord(word, defaultName, defaultEquivalentName));
    const [relationChooserOpen, setRelationChooserOpen] = useState(false);
    const [resourceListOpen, setResourceListOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const editingRelationIndexRef = useRef<number>();
    const {trans} = useTrans("wordEditor");
    const {request} = useRequest();
    const {addInformationPopup} = usePopup();

    const mutateWord = useCallback(function <T extends Array<unknown>>(setter: (tempWord: TempEditableWord, ...args: T) => void): (...args: T) => void {
      const wrapper = function (...args: T): void {
        setTempWord((tempWord) => {
          setter(tempWord, ...args);
          onTempSet?.(tempWord);
          return {...tempWord};
        });
      };
      return wrapper;
    }, [onTempSet]);

    const openRelationChooser = useCallback(function (index: number): void {
      editingRelationIndexRef.current = index;
      setRelationChooserOpen(true);
    }, []);

    const editRelation = useCallback(function (relationWord: Word, direction: "oneway" | "mutual"): void {
      setTempWord((tempWord) => {
        const relationIndex = editingRelationIndexRef.current!;
        if (tempWord.relations[relationIndex] === undefined) {
          tempWord.relations[relationIndex] = {...Relation.createEmpty(), tempId: nanoid()};
        }
        tempWord.relations[relationIndex].tempId = relationWord.id;
        tempWord.relations[relationIndex].number = relationWord.number;
        tempWord.relations[relationIndex].name = relationWord.name;
        tempWord.relations[relationIndex].mutual = direction === "mutual";
        return {...tempWord};
      });
      setRelationChooserOpen(false);
    }, []);

    const createSuggest = useCallback(function (propertyName: string): Suggest {
      const number = dictionary.number;
      const suggest = async function (pattern: string): Promise<Array<SuggestionSpec>> {
        const response = await request("suggestDictionaryTitles", {number, propertyName, pattern}, {ignoreError: true});
        if (response.status === 200 && !("error" in response.data)) {
          const titles = response.data;
          const suggestions = titles.map((title) => ({replacement: title, node: title}));
          return suggestions;
        } else {
          return [];
        }
      };
      return suggest;
    }, [dictionary.number, request]);

    const addRelations = useCallback(async function (editedWord: Word): Promise<void> {
      const number = dictionary.number;
      const specs = tempWord.relations.filter((relation) => relation.mutual).map((relation) => {
        const inverseRelation = Relation.createEmpty();
        inverseRelation.number = editedWord.number;
        inverseRelation.name = editedWord.name;
        inverseRelation.titles = relation.titles;
        return {wordNumber: relation.number, relation: inverseRelation};
      });
      if (specs.length > 0) {
        await request("addRelations", {number, specs});
      }
    }, [dictionary, tempWord, request]);

    const editWord = useCallback(async function (event: MouseEvent<HTMLButtonElement>): Promise<void> {
      const number = dictionary.number;
      const word = recreateWord(tempWord);
      const response = await request("editWord", {number, word});
      if (response.status === 200 && !("error" in response.data)) {
        const editedWord = response.data;
        await addRelations(editedWord);
        addInformationPopup("wordEdited");
        await onEditConfirm?.(word, event);
        await invalidateQueries("searchWord", (data) => data.number === number);
      }
    }, [dictionary, tempWord, request, onEditConfirm, addInformationPopup, addRelations]);

    const discardWord = useCallback(async function (event: MouseEvent<HTMLButtonElement>): Promise<void> {
      const number = dictionary.number;
      const wordNumber = tempWord.number;
      if (wordNumber !== undefined) {
        const response = await request("discardWord", {number, wordNumber});
        if (response.status === 200) {
          addInformationPopup("wordDiscarded");
          await onDiscardConfirm?.(event);
          await invalidateQueries("searchWord", (data) => data.number === number);
        }
      }
    }, [dictionary, tempWord, request, onDiscardConfirm, addInformationPopup]);

    const editorProps = {dictionary, word, tempWord, mutateWord, createSuggest, openRelationChooser, onCancel, editWord, setAlertOpen, setResourceListOpen};
    const node = (
      <Fragment>
        <WordEditorRoot {...editorProps}/>
        <Overlay size="large" title={trans(":wordSearcher.title")} open={relationChooserOpen} onClose={() => setRelationChooserOpen(false)}>
          <WordSearcher dictionary={dictionary} style="simple" showButton={true} showDirectionButton={true} onSubmit={editRelation}/>
        </Overlay>
        <Overlay size="large" title={trans(":resourceList.title")} open={resourceListOpen} onClose={() => setResourceListOpen(false)}>
          <Suspense fallback={<Loading/>}>
            <ResourceList dictionary={dictionary} size={10} showCode={true} showInstruction={true}/>
          </Suspense>
        </Overlay>
        <Alert
          text={trans("alert")}
          confirmLabel={trans("alertConfirm")}
          open={alertOpen}
          outsideClosable={true}
          onClose={() => setAlertOpen(false)}
          onConfirm={discardWord}
        />
      </Fragment>
    );
    return node;

  }
);


const WordEditorRoot = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    word,
    tempWord,
    mutateWord,
    createSuggest,
    openRelationChooser,
    onCancel,
    editWord,
    setAlertOpen,
    setResourceListOpen
  }: {
    dictionary: EnhancedDictionary,
    word: Word | null,
    tempWord: TempEditableWord,
    mutateWord: MutateWordCallback,
    createSuggest: (propertyName: string) => Suggest,
    openRelationChooser: (index: number) => void,
    onCancel?: (event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>,
    editWord: (event: MouseEvent<HTMLButtonElement>) => Promise<void>,
    setAlertOpen: Dispatch<SetStateAction<boolean>>,
    setResourceListOpen: Dispatch<SetStateAction<boolean>>
  }): ReactElement {

    const {trans} = useTrans("wordEditor");

    const innerProps = {dictionary, tempWord, mutateWord, createSuggest};
    const node = (
      <div styleName="root">
        <div styleName="editor">
          <WordEditorName {...innerProps}/>
          <WordEditorEquivalents {...innerProps}/>
          <WordEditorInformations {...innerProps}/>
          <WordEditorVariations {...innerProps}/>
          <WordEditorRelations {...innerProps} {...{openRelationChooser}}/>
        </div>
        <div styleName="footer">
          <div styleName="confirm-button-container">
            <Button label={trans("resource")} iconName="image" onClick={() => setResourceListOpen(true)}/>
          </div>
          <div styleName="confirm-button-container">
            <Button label={trans("cancel")} iconName="times" variant="light" onClick={onCancel}/>
            {(word !== null) && (
              <Button label={trans("discard")} iconName="trash-alt" scheme="red" onClick={() => setAlertOpen(true)}/>
            )}
            <Button label={trans("confirm")} iconName="check" scheme="blue" reactive={true} onClick={editWord}/>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const WordEditorName = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    tempWord,
    mutateWord
  }: {
    dictionary: EnhancedDictionary,
    tempWord: TempEditableWord,
    mutateWord: MutateWordCallback
  }): ReactElement {

    const {trans} = useTrans("wordEditor");
    const {request} = useRequest();

    const generateName = useCallback(function (zatlin: Zatlin): void {
      try {
        const name = zatlin.generate();
        mutateWord((tempWord) => tempWord.name = name)();
      } catch (error) {
        console.log(error);
      }
    }, [mutateWord]);

    const validateName = useCallback(async function (name: string): Promise<ValidationSpec | null> {
      const number = dictionary.number;
      const excludedWordNumber = tempWord.number;
      const response = await request("checkDuplicateWordName", {number, name, excludedWordNumber}, {ignoreError: true});
      if (response.status === 200 && !("error" in response.data)) {
        const {duplicate} = response.data;
        if (duplicate) {
          return {scheme: "primary", iconName: "circle-info", message: trans("duplicateName")};
        } else {
          return null;
        }
      } else {
        return null;
      }
    }, [dictionary.number, tempWord.number, request, trans]);

    const zatlin = dictionary.getZatlin();
    const node = (
      <div styleName="section">
        <div styleName="head">
          {trans("basic")}
        </div>
        <div styleName="section-content">
          <div styleName="section-item">
            <div styleName="form-container">
              <div styleName="form">
                <div styleName="generate-container">
                  <Input
                    label={trans("name")}
                    styleName="name"
                    value={tempWord.name}
                    validate={dictionary.settings.enableDuplicateName ? validateName : undefined}
                    debounceValidate={true}
                    onSet={mutateWord((tempWord, name) => tempWord.name = name)}
                  />
                  {(zatlin !== null) && (
                    <div styleName="control-button-container">
                      <Button label={trans("generate")} variant="light" onClick={() => generateName(zatlin)}/>
                    </div>
                  )}
                </div>
                <Input styleName="name" label={trans("pronunciation")} value={tempWord.pronunciation} onSet={mutateWord((tempWord, pronunciation) => tempWord.pronunciation = pronunciation || undefined)}/>
                <MultiInput styleName="name" label={trans("tag")} values={tempWord.tags} onSet={mutateWord((tempWord, tags) => tempWord.tags = tags)}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const WordEditorEquivalents = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    tempWord,
    mutateWord,
    createSuggest
  }: {
    dictionary: EnhancedDictionary,
    tempWord: TempEditableWord,
    mutateWord: MutateWordCallback,
    createSuggest: (propertyName: string) => Suggest
  }): ReactElement {

    const {trans} = useTrans("wordEditor");

    const node = (
      <div styleName="section">
        <div styleName="head">
          {trans("equivalent")}
        </div>
        <div styleName="section-content">
          {tempWord.equivalents.map((equivalent, index) => (
            <WordEditorEquivalent key={equivalent.tempId} {...{dictionary, tempWord, equivalent, index, mutateWord, createSuggest}}/>
          ))}
          <div styleName="plus">
            <div styleName="absent">{(tempWord.equivalents.length <= 0) ? trans("equivalentAbsent") : ""}</div>
            <div styleName="plus-button-container">
              <Button iconName="plus" variant="light" onClick={mutateWord((tempWord) => tempWord.equivalents.push({...Equivalent.createEmpty(), tempId: nanoid(), string: ""}))}/>
            </div>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const WordEditorEquivalent = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    tempWord,
    equivalent,
    index,
    mutateWord,
    createSuggest
  }: {
    dictionary: EnhancedDictionary,
    tempWord: TempEditableWord,
    equivalent: TempEquivalent,
    index: number,
    mutateWord: MutateWordCallback,
    createSuggest: (propertyName: string) => Suggest
  }): ReactElement {

    const {trans} = useTrans("wordEditor");
    const [rootRef, handleRef, dragging] = useDragDrop(
      `equivalent-${dictionary.id}-${tempWord.tempId}`,
      index,
      mutateWord((tempWord, draggingIndex, hoverIndex) => moveAt(tempWord.equivalents, draggingIndex, hoverIndex))
    );

    const suggest = createSuggest("equivalent");
    const node = (
      <div styleName="section-item" ref={rootRef} {...data({dragging})}>
        <div styleName="handle" ref={handleRef}>
          <div styleName="handle-icon"><Icon name="grip-vertical"/></div>
        </div>
        <div styleName="form-container">
          <div styleName="form">
            <MultiInput styleName="title" label={trans("equivalentTitle")} values={equivalent.titles} suggest={suggest} onSet={mutateWord((tempWord, titles) => tempWord.equivalents[index].titles = titles)}/>
            <Input styleName="name" label={trans("equivalentNames")} value={equivalent.string} onSet={mutateWord((tempWord, string) => tempWord.equivalents[index].string = string)}/>
          </div>
          <div styleName="control-button-container">
            <Button iconName="minus" variant="light" onClick={mutateWord((tempWord) => deleteAt(tempWord.equivalents, index))}/>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const WordEditorInformations = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    tempWord,
    mutateWord,
    createSuggest
  }: {
    dictionary: EnhancedDictionary,
    tempWord: TempEditableWord,
    mutateWord: MutateWordCallback,
    createSuggest: (propertyName: string) => Suggest
  }): ReactElement {

    const {trans} = useTrans("wordEditor");

    const node = (
      <div styleName="section">
        <div styleName="head">
          {trans("information")}
        </div>
        <div styleName="section-content">
          {tempWord.informations.map((information, index) => (
            <WordEditorInformation key={information.tempId} {...{dictionary, tempWord, information, index, mutateWord, createSuggest}}/>
          ))}
          <div styleName="plus">
            <div styleName="absent">{(tempWord.informations.length <= 0) ? trans("informationAbsent") : ""}</div>
            <div styleName="plus-button-container">
              <Button iconName="plus" variant="light" onClick={mutateWord((tempWord) => tempWord.informations.push({...Information.createEmpty(), tempId: nanoid()}))}/>
            </div>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const WordEditorInformation = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    tempWord,
    information,
    index,
    mutateWord,
    createSuggest
  }: {
    dictionary: EnhancedDictionary,
    tempWord: TempEditableWord,
    information: TempInformation,
    index: number,
    mutateWord: MutateWordCallback,
    createSuggest: (propertyName: string) => Suggest
  }): ReactElement {

    const {trans} = useTrans("wordEditor");
    const [rootRef, handleRef, dragging] = useDragDrop(
      `information-${dictionary.id}-${tempWord.tempId}`,
      index,
      mutateWord((tempWord, draggingIndex, hoverIndex) => moveAt(tempWord.informations, draggingIndex, hoverIndex))
    );

    const language = (dictionary.settings.enableMarkdown) ? "markdown" as const : undefined;
    const suggest = createSuggest("information");
    const node = (
      <div styleName="section-item" ref={rootRef} {...data({dragging})}>
        <div styleName="handle" ref={handleRef}>
          <div styleName="handle-icon"><Icon name="grip-vertical"/></div>
        </div>
        <div styleName="form-container">
          <div styleName="form information">
            <Input styleName="title" label={trans("informationTitle")} value={information.title} suggest={suggest} onSet={mutateWord((tempWord, title) => tempWord.informations[index].title = title)}/>
            <TextArea styleName="text" label={trans("informationText")} value={information.text} language={language} showButtons={true} onSet={mutateWord((tempWord, text) => tempWord.informations[index].text = text)}/>
          </div>
          <div styleName="control-button-container">
            <Button iconName="minus" variant="light" onClick={mutateWord((tempWord) => deleteAt(tempWord.informations, index))}/>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const WordEditorVariations = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    tempWord,
    mutateWord,
    createSuggest
  }: {
    dictionary: EnhancedDictionary,
    tempWord: TempEditableWord,
    mutateWord: MutateWordCallback,
    createSuggest: (propertyName: string) => Suggest
  }): ReactElement {

    const {trans} = useTrans("wordEditor");

    const node = (
      <div styleName="section">
        <div styleName="head">
          {trans("variation")}
        </div>
        <div styleName="section-content">
          {tempWord.variations.map((variation, index) => (
            <WordEditorVariation key={variation.tempId} {...{dictionary, tempWord, variation, index, mutateWord, createSuggest}}/>
          ))}
          <div styleName="plus">
            <div styleName="absent">{(tempWord.variations.length <= 0) ? trans("variationAbsent") : ""}</div>
            <div styleName="plus-button-container">
              <Button iconName="plus" variant="light" onClick={mutateWord((tempWord) => tempWord.variations.push({...Variation.createEmpty(), tempId: nanoid()}))}/>
            </div>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const WordEditorVariation = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    tempWord,
    variation,
    index,
    mutateWord,
    createSuggest
  }: {
    dictionary: EnhancedDictionary,
    tempWord: TempEditableWord,
    variation: TempVariation,
    index: number,
    mutateWord: MutateWordCallback,
    createSuggest: (propertyName: string) => Suggest
  }): ReactElement {

    const {trans} = useTrans("wordEditor");
    const [rootRef, handleRef, dragging] = useDragDrop(
      `variation-${dictionary.id}-${tempWord.tempId}`,
      index,
      mutateWord((tempWord, draggingIndex, hoverIndex) => moveAt(tempWord.variations, draggingIndex, hoverIndex))
    );

    const suggest = createSuggest("variation");
    const node = (
      <div styleName="section-item" ref={rootRef} {...data({dragging})}>
        <div styleName="handle" ref={handleRef}>
          <div styleName="handle-icon"><Icon name="grip-vertical"/></div>
        </div>
        <div styleName="form-container">
          <div styleName="form">
            <Input styleName="title" label={trans("variationTitle")} value={variation.title} suggest={suggest} onSet={mutateWord((tempWord, title) => tempWord.variations[index].title = title)}/>
            <Input styleName="name" label={trans("variationName")} value={variation.name} onSet={mutateWord((tempWord, name) => tempWord.variations[index].name = name)}/>
          </div>
          <div styleName="control-button-container">
            <Button iconName="minus" variant="light" onClick={mutateWord((tempWord) => deleteAt(tempWord.variations, index))}/>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const WordEditorRelations = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    tempWord,
    mutateWord,
    createSuggest,
    openRelationChooser
  }: {
    dictionary: EnhancedDictionary,
    tempWord: TempEditableWord,
    mutateWord: MutateWordCallback,
    createSuggest: (propertyName: string) => Suggest,
    openRelationChooser: (index: number) => void
  }): ReactElement {

    const {trans} = useTrans("wordEditor");

    const node = (
      <div styleName="section">
        <div styleName="head">
          {trans("relation")}
        </div>
        <div styleName="section-content">
          {tempWord.relations.map((relation, index) => (
            <WordEditorRelation key={relation.tempId} {...{dictionary, tempWord, relation, index, mutateWord, createSuggest, openRelationChooser}}/>
          ))}
          <div styleName="plus">
            <div styleName="absent">{(tempWord.relations.length <= 0) ? trans("relationAbsent") : ""}</div>
            <div styleName="plus-button-container">
              <Button iconName="plus" variant="light" onClick={() => openRelationChooser(tempWord.relations.length)}/>
            </div>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


const WordEditorRelation = create(
  require("./word-editor.scss"),
  function ({
    dictionary,
    tempWord,
    relation,
    index,
    mutateWord,
    openRelationChooser,
    createSuggest
  }: {
    dictionary: EnhancedDictionary,
    tempWord: TempEditableWord,
    relation: TempRelation,
    index: number,
    mutateWord: MutateWordCallback,
    createSuggest: (propertyName: string) => Suggest,
    openRelationChooser: (index: number) => void
  }): ReactElement {

    const {trans} = useTrans("wordEditor");
    const [rootRef, handleRef, dragging] = useDragDrop(
      `relation-${dictionary.id}-${tempWord.tempId}`,
      index,
      mutateWord((tempWord, draggingIndex, hoverIndex) => moveAt(tempWord.relations, draggingIndex, hoverIndex))
    );

    const suggest = createSuggest("relation");
    const node = (
      <div styleName="section-item" ref={rootRef} {...data({dragging})}>
        <div styleName="handle" ref={handleRef}>
          <div styleName="handle-icon"><Icon name="grip-vertical"/></div>
        </div>
        <div styleName="form-container">
          <div styleName="form">
            <MultiInput styleName="title" label={trans("relationTitle")} values={relation.titles} suggest={suggest} onSet={mutateWord((tempWord, titles) => tempWord.relations[index].titles = titles)}/>
            <ControlGroup styleName="name relation-input">
              <Input label={trans("relationName")} value={relation.name} readOnly={true}/>
              <Button label={trans("selectRelation")} variant="light" onClick={() => openRelationChooser(index)}/>
            </ControlGroup>
          </div>
          <div styleName="control-button-container">
            <Button iconName="minus" variant="light" onClick={mutateWord((tempWord) => deleteAt(tempWord.relations, index))}/>
          </div>
        </div>
      </div>
    );
    return node;

  }
);


function createTempWord(word: EditableWord | null, defaultName?: string, defaultEquivalentName?: string): TempEditableWord {
  const tempWord = cloneDeep(word) ?? EditableWord.createEmpty();
  if (defaultName) {
    tempWord.name = defaultName;
  }
  if (defaultEquivalentName) {
    const equivalent = {titles: [], names: [defaultEquivalentName]};
    tempWord.equivalents.push(equivalent);
  }
  const tempId = nanoid();
  const tags = tempWord.tags;
  const equivalents = tempWord.equivalents.map((equivalent) => ({...equivalent, tempId: nanoid(), string: equivalent.names.join(", ")}));
  const informations = tempWord.informations.map((information) => ({...information, tempId: nanoid()}));
  const variations = tempWord.variations.map((variation) => ({...variation, tempId: nanoid()}));
  const relations = tempWord.relations.map((relation) => ({...relation, tempId: nanoid()}));
  return {...tempWord, tempId, tags, equivalents, informations, variations, relations};
}

function recreateWord(tempWord: TempEditableWord): EditableWord {
  const equivalents = tempWord.equivalents.map((equivalent) => ({...equivalent, names: equivalent.string.split(/\s*(?:,|、|・)\s*/)}));
  const word = {...tempWord, equivalents};
  return word;
}

type TempEditableWord = Omit<EditableWord, "tags" | "equivalents" | "informations" | "variations" | "relations"> & {
  tempId: string,
  tags: Array<string>,
  equivalents: Array<TempEquivalent>,
  informations: Array<TempInformation>,
  variations: Array<TempVariation>,
  relations: Array<TempRelation>
};
type TempTag = {tempId: string, string: string};
type TempEquivalent = Equivalent & {tempId: string, string: string};
type TempInformation = Information & {tempId: string};
type TempVariation = Variation & {tempId: string};
type TempRelation = Relation & {tempId: string, mutual?: boolean};

export type MutateWordCallback = <T extends Array<unknown>>(setter: (tempWord: TempEditableWord, ...args: T) => void) => (...args: T) => void;

export default WordEditor;