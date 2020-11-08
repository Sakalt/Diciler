//

import {
  CustomError
} from "/client/skeleton/error";
import {
  Controller,
  GetRequest,
  GetResponse,
  PostRequest,
  PostResponse
} from "/server/controller/controller";
import {
  before,
  controller,
  get,
  post
} from "/server/controller/decorator";
import {
  SERVER_PATHS,
  SERVER_PATH_PREFIX
} from "/server/controller/interface/type";
import {
  verifyUser
} from "/server/controller/middle";
import {
  NotificationCreator,
  NotificationModel
} from "/server/model/notification";
import {
  CastUtil
} from "/server/util/cast";
import {
  QueryRange
} from "/server/util/query";


@controller(SERVER_PATH_PREFIX)
export class NotificationController extends Controller {

  @post(SERVER_PATHS["addNotification"])
  @before(verifyUser("admin"))
  public async [Symbol()](request: PostRequest<"addNotification">, response: PostResponse<"addNotification">): Promise<void> {
    let type = CastUtil.ensureString(request.body.type);
    let title = CastUtil.ensureString(request.body.title);
    let text = CastUtil.ensureString(request.body.text);
    let notification = await NotificationModel.add(type, title, text);
    let body = NotificationCreator.create(notification);
    Controller.respond(response, body);
  }

  @get(SERVER_PATHS["fetchNotifications"])
  public async [Symbol()](request: GetRequest<"fetchNotifications">, response: GetResponse<"fetchNotifications">): Promise<void> {
    let offset = CastUtil.ensureNumber(request.query.offset);
    let size = CastUtil.ensureNumber(request.query.size);
    let range = new QueryRange(offset, size);
    let hitResult = await NotificationModel.findAll(range);
    let hitNotifications = hitResult[0].map(NotificationCreator.create);
    let hitSize = hitResult[1];
    let body = [hitNotifications, hitSize] as any;
    Controller.respond(response, body);
  }

}