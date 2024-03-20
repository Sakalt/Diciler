//

import {before, controller, post} from "/server/controller/decorator";
import {Controller, FilledMiddlewareBody, Request, Response} from "/server/controller/internal/controller";
import {checkDictionary, checkMe} from "/server/controller/internal/middleware";
import {ExampleCreator} from "/server/creator";
import {ExampleModel} from "/server/model";
import {SERVER_PATH_PREFIX} from "/server/type/internal";
import {QueryRange} from "/server/util/query";
import {mapWithSize} from "/server/util/with-size";


@controller(SERVER_PATH_PREFIX)
export class ExampleController extends Controller {

  @post("/editExample")
  @before(checkMe(), checkDictionary("edit"))
  public async [Symbol()](request: Request<"editExample">, response: Response<"editExample">): Promise<void> {
    const {dictionary} = request.middlewareBody as FilledMiddlewareBody<"me" | "dictionary">;
    const {example} = request.body;
    try {
      const resultExample = await dictionary.editExample(example);
      const body = ExampleCreator.create(resultExample);
      Controller.respond(response, body);
    } catch (error) {
      Controller.respondByCustomError(response, ["dictionarySaving"], error);
    }
  }

  @post("/discardExample")
  @before(checkMe(), checkDictionary("edit"))
  public async [Symbol()](request: Request<"discardExample">, response: Response<"discardExample">): Promise<void> {
    const {dictionary} = request.middlewareBody as FilledMiddlewareBody<"me" | "dictionary">;
    const {exampleNumber} = request.body;
    try {
      const resultExample = await dictionary.discardExample(exampleNumber);
      const body = ExampleCreator.create(resultExample);
      Controller.respond(response, body);
    } catch (error) {
      Controller.respondByCustomError(response, ["noSuchExample", "dictionarySaving"], error);
    }
  }

  @post("/fetchExample")
  @before(checkDictionary())
  public async [Symbol()](request: Request<"fetchExample">, response: Response<"fetchExample">): Promise<void> {
    const {dictionary} = request.middlewareBody as FilledMiddlewareBody<"dictionary">;
    const {exampleNumber} = request.body;
    const example = await dictionary.fetchOneExampleByNumber(exampleNumber);
    if (example) {
      const body = ExampleCreator.create(example);
      Controller.respond(response, body);
    } else {
      Controller.respondError(response, "noSuchExample");
    }
  }

  @post("/fetchExamples")
  @before(checkDictionary())
  public async [Symbol()](request: Request<"fetchExamples">, response: Response<"fetchExamples">): Promise<void> {
    const {dictionary} = request.middlewareBody as FilledMiddlewareBody<"dictionary">;
    const {offset, size} = request.body;
    const range = new QueryRange(offset, size);
    const hitResult = await ExampleModel.fetchByDictionary(dictionary, range);
    const body = mapWithSize(hitResult, ExampleCreator.create);
    Controller.respond(response, body);
  }

}