## 概要
ZpDIC Online は正規表現による検索に対応しています。
辞書ページの検索欄の下にある「正規」を選択すると、検索フォーム内の文字列を正規表現として解釈して検索を行います。

「正規表現」とは、文字列が満たすべき条件を表現するための形式です。
正規表現を使うことで、例えば「最初に〈a〉から始まって途中に〈sk〉を含む」や「途中に同じ文字の連続を含む」などの条件を表現することができます。
これにより、通常なら前方一致や部分一致を組み合わせる必要がある複雑な検索を、手軽に行うことができるようになります。

このドキュメントでは、辞書検索をするためという視点に立ちつつ、正規表現の書き方の基本を解説します。

## 文字
まず前提として、正規表現における検索は基本的に部分一致です。
別の言い方をすれば、正規表現とは文字列の条件を表現するものだと最初に説明しましたが、検索対象の文字列の中にその条件を満たす箇所が存在していればヒットするということです。

さて、正規表現を書く上で最も基本となるルールは、単なる文字は「その文字自身である」という条件を表すということです。
例えば、`a` という正規表現は「〈a〉という文字である」という条件を表します。
したがって、`a` という正規表現で検索すると、検索対象の中に「〈a〉という文字である」を満たす箇所が存在していればヒットすることになるので、結果的に〈a〉を含む文字列がヒットするわけです。

以下に、正規表現による検索を試せるフォームを用意しました。
右端の「試す」をクリックすると検索ウィンドウが開くので、検索対象に様々な文字列を入れて、〈a〉を含む文字列はヒットし〈a〉を含まない文字列はヒットしないことを確認してみてください。
検索結果欄には、検索対象がヒットしたかヒットしないかに加え、正規表現が表す条件を満たしている箇所も赤色で表示されます。
```regexp-try
a
```

さて、`a` は「〈a〉という文字である」という条件を表し、`m` が「〈m〉という文字である」という条件を表すのでした。
この 2 つの正規表現を順に並べて `am` とすると、「〈a〉という文字のすぐ次に〈m〉という文字がある」という条件を表します。
その結果、`am` という正規表現は「〈am〉という文字列である」という条件を表すことになり、〈am〉を含む文字列を検索することができます。
文字を 3 つ以上並べても同様で、`ambi` とすれば「〈ambi〉という文字列である」という条件になるので、〈ambi〉を含む文字列が検索されます。
```regexp-try
ambi
```
より一般的なルールとして述べれば、複数の正規表現を並べると、それらの正規表現が表す条件を順番に満たしているという 1 つの条件を表すようになるということです。

## ワイルドカード — 「何でも良いから 1 文字」
ここまでの話だけでは、`ambi` と書くと〈ambi〉を含む文字列が検索されるということなので、正規表現を使わない単なる部分一致検索と何も変わりません。
しかし、正規表現にはいくつかの特殊な記号や構文が用意されていて、これにより複雑な条件を記述することができるようになっています。
最初に紹介するのは `.` です。

`.` はいわゆるワイルドカードで、「何でも良いから何か 1 文字」という条件を表します。
正規表現が表す条件にある文字列が合致することを「マッチする」と言うことがあるので、この言い方をすれば、`.` は何らかの文字 1 つにマッチするということです。

`.` 単独ではあまり意味はなく、前後に別の正規表現を置いて使うことが多いです。
例えば、`a.k` とすると、これは「〈a〉という文字」と「何でも良いから 1 文字」と「〈k〉という文字」をそれぞれ表す正規表現の羅列なので、これらを順に満たすという条件、すなわち「〈a〉の後に何か 1 文字挟まって次に〈k〉が来る」という条件を表します。
正規表現は部分一致であることを思い出すと、`a.k` という正規表現で検索を行うと、例えば〈ask〉や〈ankle〉や〈talk〉などがヒットします。
```regexp-try
a.k
```
他にも、`.` を複数個使って `a.p.e` とすれば「〈a〉と〈p〉と〈e〉の間にそれぞれ 1 文字入る」という条件を表すので、例えば〈apple〉や〈sample〉や〈raspberry〉などがヒットします。
```regexp-try
a.p.e
```
また、`..` とすると「何でも良いから 1 文字」が 2 つ連続していることから「何でも良いから 2 文字」を表すので、`st..ng` は「〈st〉と〈ng〉の間に 2 文字入る」を表し、〈strong〉や〈strange〉などがヒットします。
```regexp-try
st..ng
```
なお、同じ `.` という記号を使っているからといって、2 つの `.` が必ず同じ文字にマッチするとは限らないので注意してください。
あくまで `.` がそれぞれ「何でも良いから 1 文字」を表します。

ここで、`.` について特に注意すべき点が 2 つあります。
まず、これは 1 文字を表す条件であり、複数文字を表しているわけではないということです。
「ワイルドカード」というと 2 文字以上を含める任意の文字列にマッチするような印象があるかもしれませんが、正規表現の `.` は 1 文字だけにマッチします。
複数文字を表す方法については、次の節で説明します。

2 つ目の注意点として、ワイルドカードを表すのに `*` という記号を使っている検索プログラムがありますが、これは正規表現ではありません。
正規表現における `*` は別の用途に使います。
混同しないように注意してください。

## 量化子 — 「複数個」の表現
### 1 個以上
文字や記号の直後に `+` を付けると、「直前の文字 (もしくは記号) が表す条件を満たすものが 1 個以上連続する」という条件を表します。
例えば `e+` とすると、「〈e〉という文字」を表す正規表現に `+` が付いているので、「〈e〉が 1 文字以上連続する」という条件を表します。
これを使って `me+t` とすれば、「〈m〉の後に〈e〉が 1 文字以上連続して次に〈t〉が来る」という条件を表すので、〈met〉や〈meet〉や〈meeting〉などがヒットします。
```regexp-try
me+t
```

注意すべき点として、`+` は直前の 1 文字だけに係ります。
前の例の `me+t` では、`+` が係るのは `e` だけなので「〈m〉→〈e〉が 1 個以上→〈t〉の順で並ぶ」という条件を表しているのであり、`+` が `me` に係って「〈me〉が 1 個以上→〈t〉の順で並ぶ」という条件は表していません。
`+` を `me` に係らせて「〈me〉が 1 個以上→〈t〉の順で並ぶ」を表したいときは、括弧によるグルーピングを用いて `(me)+t` とする必要があります。
こうすると、〈memetics〉がヒットするようになります。
```regexp-try
(me)+t
```

前の節で説明した `.` に対して `+` を付けて `.+` とすれば、「何らかの 1 文字が 1 個以上連続する」すなわち「何らかの文字複数個」を表せます。
これを使って `m.+t` とすれば、「〈m〉と〈t〉の間に何らかの文字が複数個入る」という条件を表すので、〈mint〉や〈smooth〉などがヒットします。
```regexp-try
m.+t
```
ここで、`+` には「1 個以上連続している部分が全て同じ文字列である」という意味合いはないことに注意してください。
つまり、`.+` と書いたからといって、同じ文字列の連続だけがヒットするとは限りません。
したがって、`m.+t` で検索をすると、〈meet〉や〈moot〉の他にも〈mint〉などもヒットすることになります。

このことは括弧によるグルーピングを使った場合も同様です。
例えば `(m.)+t` と書くと、「`m.` にマッチする文字列が複数個連続した後に〈t〉が来る」という条件、もう少し噛み砕けば「〈m〉の後に何か 1 文字という並びが複数個連続した後に〈t〉が来る」という条件を表しますが、連続する「〈m〉の後に何か 1 文字」の部分の〈m〉の後に来る文字は異なっていても構わないことになります。
したがって、〈memetics〉の他に、〈m〉の後に〈o〉と〈e〉が続いている〈thermometer〉などもヒットします。
```regexp-try
(m.)+t
```

### 0 個以上
`+` は 1 個以上の繰り返しを表しましたが、`*` は 0 個以上の繰り返しを表します。
つまり、`*` の前に置かれた条件を満たす文字列は存在しなくても良いということになります。

`*` の使い方は `+` と全く同じで、直前の 1 文字だけに係り、複数文字の繰り返しを表したいときは括弧によるグルーピングを行う必要があります。
例えば `(re)*lease` と書くと、「〈re〉の 0 個以上連続した後に〈lease〉が来る」という条件になるので、〈release〉や〈rerelease〉の他に、〈re〉を全く含まない〈lease〉もヒットします。
```regexp-try
(re)*lease
```

`+` と同様に、`*` には「連続している部分が全て同じ文字列である」という意味合いがないことには再び注意してください。
例えば `(.i)*c` には、〈mimic〉などの他にも、複数個ある〈i〉の前の文字が異なる〈critical〉や〈specific〉などもヒットします。
```regexp-try
(.i)*c
```

### 0 個か 1 個
文字や記号の直後に `?` を付けると、「直前の文字 (もしくは記号) が 1 個あるか全くないかのどちらか」という条件を表します。
別の言い方をすれば、`?` の直前にマッチするものはあってもなくても良いということです。
例えば `apples?` と書くと、「〈apple〉の後に〈s〉があってもなくても良い」という条件を表すので、〈apple〉も〈apples〉もヒットします。
```regexp-try
apples?
```

`?` の使い方も `+` や `*` と同様で、直前の 1 文字だけに係り、複数文字の繰り返しを表したいときは括弧によるグルーピングを使う必要があります。

## 前方一致と後方一致
正規表現による検索は部分一致でした。
したがって、`ambi` という正規表現で検索すると〈ambi〉を含む文字列がヒットするので、〈gambit〉のように〈ambi〉から始まっていなくても途中に〈ambi〉を含んでさえすればヒットします。
では、正規表現による検索で前方一致は実現できないかというとそうではなく、`^` という記号を用いることで前方一致検索を行うことができます。

正規表現の先頭に `^` を付けると、前方一致検索を行うようになります。
例えば `^ambi` と書くと、「`ambi` が表す条件を満たすものから始まる」という条件を表し、したがって「〈ambi〉という文字列から始まる」という意味になります。
これにより、検索結果から〈gambit〉などを排除することができます。
```regexp-try
^ambi
```

正規表現の末尾に `$` を付けると、今度は後方一致検索になります。
例えば `ment$` と書くと、「〈ment〉という文字列で終わる」という意味になります。
```regexp-try
ment$
```

先頭に `^` を付けてさらに末尾に `$` を付けると、前方一致検索かつ後方一致検索になるので、完全一致検索をすることができます。
例えば `^b.g$` という正規表現は、`b.g` という「〈b〉と〈g〉の間に 1 文字入る」という意味の正規表現による完全一致検索を行うため、〈big〉や〈bag〉などはヒットしますが、文字列全体がこの条件に合致しているわけではない〈begin〉や〈cabbage〉はヒットしません。
```regexp-try
^b.g$
```

これまで説明した構文を用いると、「～から始まって～を含む」という形式の検索を正規表現で行うことができます。
例として `^a.*sk` という正規表現について考えてみましょう。
`.*` は「何でも良いから 1 文字が 0 回以上繰り返されている」という意味でしたから、`a.*sk` の部分は「〈a〉の後に何文字か (0 文字でも良い) が入り〈sk〉が続く」という意味です。
`^a.*sk` はこれに `^` が付けられているので、「文字列の先頭から見て〈a〉の後に何文字かが入り〈sk〉が続く」という条件、言い換えれば「〈a〉から始まって途中に〈sk〉がある」という条件を表します。
したがって、これには〈ask〉や〈askew〉や〈asterisk〉などがヒットします。
```regexp-try
^a.*sk
```

次は `^c.*t.*er$` という正規表現を考えてみましょう。
再び `.*` が「何でも良いから文字列」を表すことを思い出すと、`c.*t.*er` とは「〈c〉の後に何か文字列が挟まり〈t〉が続きさらに何か文字列が挟まって〈er〉が続く」という意味です。
これが `^` と `$` で挟まれて完全一致検索をするようになっているので、`^c.*t.*er$` は「〈c〉で始まって途中に〈t〉があり〈er〉で終わる」という意味になります。
これには〈catcher〉や〈center〉や〈cutover〉などがヒットします。
```regexp-try
^c.*t.*er$
```

## 選択
### 文字クラスによる方法
複数の文字を並べて `[` と `]` で囲むことで、それ全体で「並べられた文字列のいずれか」という条件を表せます。
この形の正規表現は「文字クラス」と呼ばれます。
例えば `[aeiou]` と書けば、「〈a〉, 〈e〉, 〈i〉, 〈o〉, 〈u〉のいずれか」を表します。
仮に〈a〉, 〈e〉, 〈i〉, 〈o〉, 〈u〉の 5 文字のことを「母音字」と呼ぶことにすれば、`[aeiou]` は母音字のどれかにマッチする正規表現というわけです。
```regexp-try
[aeiou]
```
例えば `c[aeiou]t` という正規表現は、「〈c〉の後に母音字が続いて〈t〉が続く」という意味になるので、〈cat〉や〈cut〉がヒットします。
```regexp-try
c[aeiou]t
```

`[` と `]` で囲まれた内部に限り、文字と文字の間に `-` を挟むことで文字の範囲を表すことができます。
例えば `[a-d]` と書くと、「〈a〉から〈d〉までの文字のいずれか」すなわち「〈a〉, 〈b〉, 〈c〉, 〈d〉のいずれか」を表します。
```regexp-try
[a-d]
```
文字の範囲は複数個並べることもでき、例えば `[a-dp-s]` と書けば、「〈a〉から〈d〉までの文字のいずれかもしくは〈p〉から〈s〉までの文字のいずれか」を表せます。
```regexp-try
[a-dp-s]
```
この応用として、`[a-zA-Z]` は「ラテン文字のどれか」の意味になります。
```regexp-try
[a-zA-Z]
```
注意として、この文字の範囲を表す記法は `[` と `]` の内部でしか使えません。
`[` と `]` で囲まれていない箇所で `a-d` と書いても、それは単に〈a-d〉という文字列そのものを表すにすぎません。

もう 1 つの注意点として、`[` と `]` の内部に書けるのは単なる文字だけで、任意の正規表現が書けるわけではありません。
複数の正規表現のどれかにマッチする正規表現を書きたい場合は、後述する論理和を用いてください。

### 文字クラスの否定
`[` と `]` で囲まれた表現において、`[` の直後に `^` を置くと「並べられた文字のいずれでもない 1 文字」という否定の意味になります。
例えば `[aeiou]` の代わりに `[^aeiou]` と書くと、「母音字以外の 1 文字」を表します。
```regexp-try
[^aeiou]
```

これを用いて例えば `[^aeiou][aeiou][^aeiou]` とすれば、「母音字以外の文字の後に母音字が続いてもう一度母音字以外の文字が続く」という条件を表せます。
いわゆる CVC の 1 音節を表せているわけです。
この正規表現で検索をすれば、〈cat〉や〈dog〉や〈fox〉などがヒットします。
```regexp-try
[^aeiou][aeiou][^aeiou]
```

文字クラスにおいて否定を表す `^` という記号は、前方一致検索をさせるときに使う `^` と同じ記号です。
すなわち、`^` という記号は、文字クラスの中か外かで全く異なる意味になるということです。
例えば、`^[^aeiou]` という正規表現において、最初の `^` は前方一致検索を意味していて、2 つ目の `^` は文字クラスの否定を表しています。

### 論理和による方法
複数の正規表現を `|` で区切って全体を `(` と `)` で囲むことで、「区切られた正規表現がそれぞれ表す条件のうちいずれかを満たす」という条件を表すことができます。
例えば `(in|re)` とすれば、「`in` が表す条件か `re` が表す条件のどちらかを満たす」すなわち「〈in〉もしくは〈re〉」という意味になります。
したがって、`(in|re)ject` で検索すると〈inject〉と〈reject〉がともにヒットします。
```regexp-try
(in|re)ject
```

## 特殊文字のエスケープ
ここまでで様々な記号や構文について説明しましたが、そこでは `.`, `^`. `$`, `[` など様々な記号が使われていました。
そのため、例えば〈2.6〉という文字列を表す正規表現を書こうとして `2.6` と書くと、ここに含まれている `.` は特殊記号として「何でも良いから 1 文字」を表してしまうので、〈2.6〉の他にも〈2d6〉などもマッチしてしまいます。
このように、正規表現における特殊記号をその文字そのものとして扱いたい場合は、直前に `\` を置いて `\.` のように書く必要があります。
つまり、〈2.6〉という文字列そのものを表す正規表現は `2\.6` ということになります。
```regexp-try
2\.6
```

`\` を置いて文字そのものを表すようにすることは「エスケープ」と呼ばれます。
エスケープが必要な記号は `.`, `^`, `$`, `+`, `*`, `?`, `|`, `(`, `)`, `[`, `]`, `{`, `}`, `\` の 14 個です。
これに追加して、文字クラスの内部では `-` もエスケープが必要になります。
本来ならエスケープが必要ない記号であっても `\` を前置してエラーになることはないので、記号には常に `\` を前置すると覚えてしまっても問題はないでしょう。