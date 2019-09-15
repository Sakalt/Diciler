//

import * as parser from "body-parser";
import * as connect from "connect-mongo";
import * as express from "express";
import {
  Express
} from "express";
import * as session from "express-session";
import * as mongoose from "mongoose";
import {
  Schema
} from "mongoose";
import * as multer from "multer";
import * as passport from "passport";
import {
  IStrategyOptions,
  Strategy as LocalStrategy
} from "passport-local";
import {
  DictionaryController
} from "./controller/dictionary";
import {
  UserController
} from "./controller/user";
import {
  UserDocument,
  UserModel
} from "./model/user";


const PORT = 3000;
const HOSTNAME = "localhost";

const SESSION_SECRET = "session zpdic";
const SESSION_EXPIRE_HOUR = 3;

const MONGO_URI = "mongodb://localhost:27017/zpdic";


class Main {

  private application: Express;

  public constructor() {
    this.application = express();
  }

  public main(): void {
    this.setupParsers();
    this.setupMulter();
    this.setupSession();
    this.setupPassport();
    this.setupMongo();
    this.setupRouters();
    this.setupStaticRouters();
    this.listen();
  }

  // リクエストボディをパースする body-parser の設定をします。
  private setupParsers(): void {
    let urlencodedParser = parser.urlencoded({extended: false});
    let jsonParser = parser.json();
    this.application.use(urlencodedParser);
    this.application.use(jsonParser);
  }

  // ファイルをアップロードする処理を行う Multer の設定をします。
  // アップロードされたファイルは upload フォルダ内に保存するようにしています。
  private setupMulter(): void {
    let middleware = multer({dest: "./upload/"}).single("file");
    this.application.use(middleware);
  }

  // セッション管理を行う express-session の設定を行います。
  // セッションストアとして、MongoDB の該当データベース内の sessions コレクションを用いるようになっています。
  private setupSession(): void {
    let MongoStore = connect(session);
    let store = new MongoStore({url: MONGO_URI, collection: "sessions"});
    let secret = SESSION_SECRET;
    let cookie = {maxAge: SESSION_EXPIRE_HOUR * 60 * 60 * 1000};
    let middleware = session({store, secret, cookie, resave: false, saveUninitialized: false});
    this.application.use(middleware);
  }

  // 認証を行うミドルウェアである Passport の設定を行います。
  // 現状では、ユーザー名とパスワードによる認証に関する設定のみを行います。
  // セッションに保持するデータとして、MongoDB 内の ID を利用するようにしています。
  // あらかじめセッションの設定をしておく必要があるため、setupSession メソッドより後に実行してください。
  private setupPassport(): void {
    let options = {usernameField: "name", passReqToCallback: false};
    let strategy = new LocalStrategy(<IStrategyOptions>options, async (name, password, done) => {
      let user = await UserModel.authenticate(name, password);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
    passport.use(strategy);
    passport.serializeUser<UserDocument, string>((user, done) => {
      done(null, user.id);
    });
    passport.deserializeUser<UserDocument, string>(async (id, done) => {
      try {
        let user = await UserModel.findById(id);
        done(null, user || undefined);
      } catch (error) {
        done(error);
      }
    });
    this.application.use(passport.initialize());
    this.application.use(passport.session());
  }

  // MongoDB との接続を扱う mongoose とそのモデルを自動で生成する typegoose の設定を行います。
  // typegoose のデフォルトでは、空文字列を入れると値が存在しないと解釈されてしまうので、空文字列も受け入れるようにしています。
  private setupMongo(): void {
    let SchemaString = <any>Schema.Types.String;
    let check = function (value: string): boolean {
      return value !== null;
    };
    SchemaString.checkRequired(check);
    mongoose.connect(MONGO_URI);
  }

  // ルーターの設定を行います。
  // このメソッドは、各種ミドルウェアの設定メソッドを全て呼んだ後に実行してください。
  private setupRouters(): void {
    UserController.use(this.application);
    DictionaryController.use(this.application);
  }

  // 静的ファイルのルーターの設定を行います。
  // このメソッドは、各種ミドルウェアの設定メソッドおよび他のルーターの設定メソッドを全て呼んだ後に実行してください。
  private setupStaticRouters(): void {
    this.application.use(express.static(process.cwd() + "/dist/client"));
    this.application.use("/*", express.static(process.cwd() + "/dist/client/index.html"));
  }

  private listen(): void {
    this.application.listen(PORT, HOSTNAME, () => {
      console.log("Listening on port " + PORT);
    });
  }

}


let main = new Main();
main.main();