//

import {
  CustomError
} from "/client/skeleton/error";
import {
  before,
  controller,
  post
} from "/server/controller/decorator";
import {
  Controller,
  Request,
  Response
} from "/server/controller/internal/controller";
import {
  verifyDictionary,
  verifyUser
} from "/server/controller/internal/middle";
import {
  SERVER_PATHS,
  SERVER_PATH_PREFIX
} from "/server/controller/internal/type";
import {
  WordCreator
} from "/server/model/dictionary";


@controller(SERVER_PATH_PREFIX)
export class WordController extends Controller {

  @post(SERVER_PATHS["editWord"])
  @before(verifyUser(), verifyDictionary("edit"))
  public async [Symbol()](request: Request<"editWord">, response: Response<"editWord">): Promise<void> {
    let dictionary = request.dictionary;
    let word = request.body.word;
    if (dictionary) {
      try {
        let resultWord = await dictionary.editWord(word);
        let body = WordCreator.create(resultWord);
        Controller.respond(response, body);
      } catch (error) {
        let body = (() => {
          if (error.name === "CustomError" && error.type === "dictionarySaving") {
            return CustomError.ofType("dictionarySaving");
          }
        })();
        Controller.respondError(response, body, error);
      }
    } else {
      let body = CustomError.ofType("noSuchDictionaryNumber");
      Controller.respondError(response, body);
    }
  }

  @post(SERVER_PATHS["removeWord"])
  @before(verifyUser(), verifyDictionary("edit"))
  public async [Symbol()](request: Request<"removeWord">, response: Response<"removeWord">): Promise<void> {
    let dictionary = request.dictionary;
    let wordNumber = request.body.wordNumber;
    if (dictionary) {
      try {
        let resultWord = await dictionary.removeWord(wordNumber);
        let body = WordCreator.create(resultWord);
        Controller.respond(response, body);
      } catch (error) {
        let body = (() => {
          if (error.name === "CustomError" && error.type === "noSuchWordNumber") {
            return CustomError.ofType("noSuchWordNumber");
          }
        })();
        Controller.respondError(response, body, error);
      }
    } else {
      let body = CustomError.ofType("noSuchDictionaryNumber");
      Controller.respondError(response, body);
    }
  }

}