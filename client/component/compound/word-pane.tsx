//

import * as react from "react";
import {
  Fragment,
  MouseEvent,
  ReactNode
} from "react";
import {
  Button,
  Link
} from "/client/component/atom";
import {
  Component
} from "/client/component/component";
import {
  WordEditor
} from "/client/component/compound";
import {
  applyStyle
} from "/client/component/decorator";
import {
  SlimeDictionarySkeleton,
  SlimeEditWordSkeleton,
  SlimeRelationSkeleton,
  SlimeWordSkeleton
} from "/server/skeleton/dictionary/slime";


@applyStyle(require("./word-pane.scss"))
export class WordPane extends Component<Props, State> {

  public static defaultProps: Partial<Props> = {
    style: "normal",
    showButton: false
  };
  public state: State = {
    editorOpen: false
  };

  private renderName(): ReactNode {
    let editButtonNode = (this.props.authorized && !this.props.showButton) && (
      <div styleName="button">
        <Button label="編集" iconLabel="&#xF044;" style="simple" hideLabel={true} onClick={() => this.setState({editorOpen: true})}/>
      </div>
    );
    let confirmButtonNode = (this.props.showButton) && (
      <div styleName="button">
        <Button label="決定" onClick={this.props.onConfirm}/>
      </div>
    );
    let tagNodes = this.props.word.tags.map((tag, index) => {
      let tagNode = (tag !== "") && <span styleName="box" key={index}>{tag}</span>;
      return tagNode;
    });
    let node = (
      <div styleName="name-wrapper">
        <div styleName="left">
          <div styleName="name">{this.props.word.name}</div>
          <div styleName="tag">{tagNodes}</div>
        </div>
        <div styleName="right">
          {editButtonNode}
          {confirmButtonNode}
        </div>
      </div>
    );
    return node;
  }

  private renderEquivalents(): ReactNode {
    let innerNodes = this.props.word.equivalents.map((equivalent, index) => {
      let titleNode = (equivalent.title !== "") && <span styleName="box">{equivalent.title}</span>;
      let innerNode = (
        <p styleName="text" key={index}>
          {titleNode}
          {equivalent.names.join(", ")}
        </p>
      );
      return innerNode;
    });
    let node = (innerNodes.length > 0) && (
      <div styleName="container">
        {innerNodes}
      </div>
    );
    return node;
  }

  private renderInformations(): ReactNode {
    let nodes = this.props.word.informations.map((information, index) => {
      let informationNode = (
        <div styleName="container" key={index}>
          <p styleName="text">
            <span styleName="title">{information.title}</span>
            {information.text}
          </p>
        </div>
      );
      return informationNode;
    });
    return nodes;
  }

  private renderRelations(): ReactNode {
    let groupedRelations = new Map<string, Array<SlimeRelationSkeleton>>();
    for (let relation of this.props.word.relations) {
      let title = relation.title;
      if (groupedRelations.get(title) === undefined) {
        groupedRelations.set(title, []);
      }
      groupedRelations.get(title)!.push(relation);
    }
    let innerNodes = Array.from(groupedRelations).map(([title, relations], index) => {
      let titleNode = (title !== "") && <span styleName="box">{title}</span>;
      let relationNodes = relations.map((relation, relationIndex) => {
        let href = "/dictionary/" + this.props.dictionary.number + "?search=" + encodeURIComponent(relation.name) + "&mode=name&type=exact&page=0";
        let relationNode = (
          <Fragment key={relationIndex}>
            {(relationIndex === 0) ? "" : ", "}
            <Link href={href}>{relation.name}</Link>
          </Fragment>
        );
        return relationNode;
      });
      let innerNode = (
        <p styleName="text" key={index}>
          <span styleName="confer">&#xF0A4;</span>
          {titleNode}
          {relationNodes}
        </p>
      );
      return innerNode;
    });
    let node = (innerNodes.length > 0) && (
      <div styleName="container">
        {innerNodes}
      </div>
    );
    return node;
  }

  private renderEditor(): ReactNode {
    let node = (
      <WordEditor
        dictionary={this.props.dictionary}
        word={this.props.word}
        open={this.state.editorOpen}
        onClose={() => this.setState({editorOpen: false})}
        onEditConfirm={this.props.onEditConfirm}
        onDeleteConfirm={this.props.onDeleteConfirm}
      />
    );
    return node;
  }

  public render(): ReactNode {
    let nameNode = this.renderName();
    let equivalentNode = this.renderEquivalents();
    let informationNode = (this.props.style === "normal") && this.renderInformations();
    let relationNode = (this.props.style === "normal") && this.renderRelations();
    let editorNode = (!this.props.showButton && this.state.editorOpen) && this.renderEditor();
    let node = (
      <div styleName="root">
        {nameNode}
        {equivalentNode}
        {informationNode}
        {relationNode}
        {editorNode}
      </div>
    );
    return node;
  }

}


type Props = {
  dictionary: SlimeDictionarySkeleton,
  word: SlimeWordSkeleton,
  style: "normal" | "simple",
  authorized: boolean,
  showButton: boolean,
  onConfirm?: (event: MouseEvent<HTMLButtonElement>) => void,
  onEditConfirm?: (word: SlimeEditWordSkeleton, event: MouseEvent<HTMLButtonElement>) => void | Promise<void>,
  onDeleteConfirm?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>
};
type State = {
  editorOpen: boolean
};