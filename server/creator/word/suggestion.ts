//

import type {
  Suggestion as SuggestionSkeleton
} from "/client/skeleton";
import {WordCreator} from "/server/creator/word/word";
import {
  Suggestion
} from "/server/model";


export namespace SuggestionCreator {

  export function skeletonize(raw: Suggestion): SuggestionSkeleton {
    const title = raw.title;
    const word = WordCreator.skeletonize(raw.word);
    const skeleton = {title, word};
    return skeleton;
  }

}