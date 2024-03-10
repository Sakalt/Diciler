//

import {ReactElement} from "react";
import {Helmet} from "react-helmet";
import {create} from "/client/component/create";


export const Title = create(
  null, "Title",
  function ({
    title
  }: {
    title?: string
  }): ReactElement {

    return (
      <Helmet>
        <title>{(title) ? `${title} — ZpDIC Online` : "ZpDIC Online"}</title>
      </Helmet>
    );

  }
);
