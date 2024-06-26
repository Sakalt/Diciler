//

import type {
  LinkedWord as LinkedWordSkeleton
} from "/client/skeleton";
import {
  LinkedWord
} from "/server/model";


export namespace LinkedWordCreator {

  export function skeletonize(raw: LinkedWord): LinkedWordSkeleton {
    const number = raw.number;
    const skeleton = {number};
    return skeleton;
  }

}