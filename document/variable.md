## 環境変数

### `PORT`
サーバーを起動するポート番号です。
指定されていない場合は 8050 が使用されます。

Heroku にデプロイする場合は、Heroku 側がこの環境変数を適切なものにあらかじめ設定します。
そのため、Heroku の環境変数の設定画面で設定する必要はありません。

### `DB_URI`
MongoDB のデータベースの URI です。

MongoDB をローカルで動かしている場合は、MongoDB 起動時に「connecting to」の後に表示される URI の後に、スラッシュとデータベース名を繋げたものにします。
データベース名は何でも構いません。
特に設定をしていなければ MongoDB 本体の URI は `mongodb://127.0.0.1:27017` になるはずなので、この変数の値には `mongodb://127.0.0.1:27017/zpdic` などを指定すれば良いです。

MongoDB をクラウドサービスなどから利用する場合は、該当サービスのドキュメントなどを参照して URI を指定してください。

### `COOKIE_SECRET`
署名付き Cookie を生成する際に用いるシークレットキーです。
適当なランダム文字列を指定してください。
指定されていない場合は `cookie-zpdic` が用いられますが、シークレットキーが流出するのはセキュリティ的に良くないので、必ず指定してください。

### `JWT_SECRET`
JSON Web Token を生成する際に用いるシークレットキーです。
適当なランダム文字列を指定してください。
指定されていない場合は `jwt-secret` が用いられますが、シークレットキーが流出するのはセキュリティ的に良くないので、必ず指定してください。

### `SENDGRID_KEY`
SendGrid の API キーです。

### `RECAPTCHA_KEY`
reCAPTCHA v3 のサイトキーです。
この変数の値はビルド時に使用されるので、実行時ではなくビルド時の段階で設定されている状態にしてください。

### `RECAPTCHA_SECRET`
reCAPTCHA v3 のシークレットキーです。

### `ANTHROPIC_KEY`
Anthropic の API キーです。
Claude 3 の API を呼ぶのに使われます。

### `FONTAWESOME_KEY`
Font Awesome のパッケージトークンです。
Pro 以上のプランに加入する必要があります。

### `AWS_KEY`
Amazon Web Service のアクセスキー ID です。

### `AWS_SECRET`
Amazon Web Service のシークレットキーです。

### `AWS_REGION`
Amazon Web Service のリージョンです。
設定されていない場合は `ap-northeast-1` が用いられます。

### `AWS_STORAGE_BUCKET`
ストレージとして使用する Amazon Web Service 内の S3 のバケット名です。