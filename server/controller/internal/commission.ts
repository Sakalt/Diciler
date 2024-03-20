//

import {before, controller, post} from "/server/controller/decorator";
import {Controller, FilledMiddlewareBody, Request, Response} from "/server/controller/internal/controller";
import {checkDictionary, checkMe, checkRecaptcha, parseDictionary} from "/server/controller/internal/middleware";
import {CommissionCreator} from "/server/creator";
import {CommissionModel} from "/server/model";
import {SERVER_PATH_PREFIX} from "/server/type/internal";
import {QueryRange} from "/server/util/query";
import {mapWithSize} from "/server/util/with-size";


@controller(SERVER_PATH_PREFIX)
export class CommissionController extends Controller {

  @post("/addCommission")
  @before(checkRecaptcha(), parseDictionary())
  public async [Symbol()](request: Request<"addCommission">, response: Response<"addCommission">): Promise<void> {
    const {dictionary} = request.middlewareBody as FilledMiddlewareBody<"dictionary">;
    const {name, comment} = request.body;
    if (name !== "") {
      const commission = await CommissionModel.add(dictionary, name, comment);
      const body = CommissionCreator.create(commission);
      Controller.respond(response, body);
    } else {
      Controller.respondError(response, "emptyCommissionName");
    }
  }

  @post("/discardCommission")
  @before(checkMe(), checkDictionary("own"))
  public async [Symbol()](request: Request<"discardCommission">, response: Response<"discardCommission">): Promise<void> {
    const {dictionary} = request.middlewareBody as FilledMiddlewareBody<"dictionary">;
    const {id} = request.body;
    const commission = await CommissionModel.fetchOneByDictionaryAndId(dictionary, id);
    if (commission) {
      await commission.discard();
      const body = CommissionCreator.create(commission);
      Controller.respond(response, body);
    } else {
      Controller.respondError(response, "noSuchCommission");
    }
  }

  @post("/fetchCommissions")
  @before(checkMe(), checkDictionary("own"))
  public async [Symbol()](request: Request<"fetchCommissions">, response: Response<"fetchCommissions">): Promise<void> {
    const {dictionary} = request.middlewareBody as FilledMiddlewareBody<"dictionary">;
    const {offset, size} = request.body;
    const range = new QueryRange(offset, size);
    const hitResult = await CommissionModel.fetchByDictionary(dictionary, range);
    const body = mapWithSize(hitResult, CommissionCreator.create);
    return Controller.respond(response, body);
  }

}