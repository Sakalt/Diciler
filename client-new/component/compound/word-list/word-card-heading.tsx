//

import {ReactElement, useMemo} from "react";
import {AdditionalProps, MultiLineText, Tag, useTrans} from "zographia";
import {create} from "/client-new/component/create";
import {DetailedWord, EnhancedDictionary, Word} from "/client-new/skeleton";


export const WordCardHeading = create(
  require("./word-card-heading.scss"), "WordCardHeading",
  function ({
    dictionary,
    word,
    ...rest
  }: {
    dictionary: EnhancedDictionary,
    word: Word | DetailedWord,
    className?: string
  } & AdditionalProps): ReactElement {

    const {transNumber} = useTrans("wordCard");

    const debug = location.hostname === "localhost";
    const pronunciation = useMemo(() => getPronunciation(dictionary, word), [dictionary, word]);

    return (
      <div styleName="root" {...rest}>
        {(debug || word.tags.length >= 0) && (
          <div styleName="tag">
            {(debug) && (
              <Tag scheme="gray">{transNumber(word.number)}</Tag>
            )}
            {word.tags.map((tag, index) => (
              <Tag key={index} variant="solid">{tag}</Tag>
            ))}
          </div>
        )}
        <div styleName="name-container">
          <MultiLineText styleName="name" is="h3">
            {word.name}
          </MultiLineText>
          <div styleName="pronunciation">
            {pronunciation}
          </div>
        </div>
      </div>
    );

  }
);


function getPronunciation(dictionary: EnhancedDictionary, word: Word | DetailedWord): string | undefined {
  if (word.pronunciation !== undefined) {
    if (word.pronunciation.match(/^(\/.+\/|\[.+\])$/)) {
      return word.pronunciation.trim();
    } else {
      return "/" + word.pronunciation.trim() + "/";
    }
  } else {
    if (dictionary.akrantiain !== null) {
      try {
        const pronunciation = dictionary.akrantiain.convert(word.name);
        return "/" + pronunciation.trim() + "/";
      } catch (error) {
        console.error(error);
        return undefined;
      }
    } else {
      return undefined;
    }
  }
}