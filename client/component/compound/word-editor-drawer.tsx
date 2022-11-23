//

import {
  ReactElement,
  useEffect
} from "react";
import Drawer from "/client/component/atom/drawer";
import DropdownItem from "/client/component/atom/dropdown-item";
import Selection from "/client/component/atom/selection";
import WordEditor from "/client/component/compound/word-editor";
import {
  create
} from "/client/component/create";
import {
  useHotkey,
  useTrans,
  useWordEditorProps
} from "/client/component/hook";
import {
  data
} from "/client/util/data";


const WordEditorDrawer = create(
  require("./word-editor-drawer.scss"), "WordEditorDrawer",
  function ({
  }: {
  }): ReactElement {

    const {trans} = useTrans("wordEditorDrawer");
    const {editorProps, editorOpen, setEditorOpen, editingId, setEditingId} = useWordEditorProps();

    useHotkey("toggleWordEditor", () => {
      setEditorOpen((wordEditorOpen) => !wordEditorOpen);
    }, []);

    useEffect(() => {
      if (editorProps.length <= 0) {
        setEditorOpen(false);
      }
    }, [editorProps.length, setEditorOpen]);

    const node = (
      <Drawer
        title={trans(":wordEditor.title")}
        iconName="custom-word"
        badgeValue={(editorProps.length > 0) ? editorProps.length : undefined}
        tabPosition="top"
        open={editorOpen}
        onOpen={() => setEditorOpen(true)}
        onClose={() => setEditorOpen(false)}
        outsideClosable={true}
      >
        {(editorProps.length > 0) && (
          <>
            <div styleName="selection-container">
              <Selection label={trans("editing")} value={editingId} onSet={setEditingId}>
                {editorProps.map((editorProps) => (
                  <DropdownItem key={editorProps.id} value={editorProps.id}>{editorProps.name || trans("noName")}</DropdownItem>
                ))}
              </Selection>
            </div>
            <div styleName="editor-list">
              {editorProps.map((editorProps) => (
                <WordEditorDrawerEditor key={editorProps.id} editingId={editingId} editorProps={editorProps}/>
              ))}
            </div>
          </>
        )}
      </Drawer>
    );
    return node;

  }
);


const WordEditorDrawerEditor = create(
  require("./word-editor-drawer.scss"),
  function ({
    editingId,
    editorProps
  }: {
    editingId: string,
    editorProps: Parameters<typeof WordEditor>[0] & {id: string}
  }): ReactElement {

    const node = (
      <div styleName="editor-container" {...data({hidden: editingId !== editorProps.id})}>
        <WordEditor {...editorProps}/>
      </div>
    );
    return node;

  }
);


export default WordEditorDrawer;