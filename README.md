# makeeyecatch

ブログタイトルを、アイキャッチ画像向けの英語プロンプトに変換する静的ツールです。

このツールは単なるプロンプト入力補助ではなく、`ブログタイトル → 視覚コンセプト変換` を主目的にしています。タイトルをそのまま描かせるのではなく、1モチーフに圧縮し、スタイルとサイズに合わせて画像生成しやすい形へ整えます。

## 特徴

- ブログタイトルを入力するだけで使える
- `正方形` / `16:9` を切り替えられる
- `浮世絵` / `70sシンプル` の2スタイルを選べる
- `文字なし` / `未指定` を選べる
- 抽象語は人物化・表情化して解釈する
- 複数要素のタイトルでも基本は `1モチーフ` に寄せる
- 完成した英語プロンプトをコピーできる
- `ChatGPT` / `Gemini` をすぐ開ける
- 選択状態と最後のタイトルを `localStorage` に保存する
- 追加した Style を cookie に保存して再利用できる
- カスタム Style は `Style名 + ベースStyle + 補足メモ` だけで登録できる

## 画面構成

- 元のブログタイトル
- 画像サイズ
- 画像Style
- 文字の扱い
- 完成プロンプト
- 解釈メモ
- ChatGPT / Gemini 導線

## プロンプト生成の考え方

生成時は次の順で組み立てます。

1. 元のブログタイトルを明示する
2. タイトルを1つの視覚アイデアへ分解する指示を入れる
3. タイトルから主題・感情・象徴を解釈する
4. 具体語なら象徴的な1モチーフを選ぶ
5. 抽象語なら人物化・表情化して主題を作る
6. Style ルールとサイズルールを合成する
7. `文字なし` の場合は text 系の禁止ルールを追加する
8. 最終的な英語プロンプトを出力する

## ファイル構成

- [index.html](/Users/flex-pc0705/makeeyecatch/index.html)
  画面本体
- [style.css](/Users/flex-pc0705/makeeyecatch/style.css)
  見た目
- [js/config.js](/Users/flex-pc0705/makeeyecatch/js/config.js)
  ルールと定数
- [js/prompt-engine.js](/Users/flex-pc0705/makeeyecatch/js/prompt-engine.js)
  タイトル解釈とプロンプト生成
- [js/storage.js](/Users/flex-pc0705/makeeyecatch/js/storage.js)
  localStorage と cookie 保存
- [js/ui.js](/Users/flex-pc0705/makeeyecatch/js/ui.js)
  DOM 操作とイベント登録
- [.github/workflows/pages.yml](/Users/flex-pc0705/makeeyecatch/.github/workflows/pages.yml)
  GitHub Pages デプロイ設定

## ローカルで使う

1. [index.html](/Users/flex-pc0705/makeeyecatch/index.html) をブラウザで開く
2. 元のブログタイトルを入力する
3. サイズ、Style、文字の扱いを選ぶ
4. `生成する` を押す
5. 出力されたプロンプトをコピーするか、ChatGPT / Gemini を開く

## GitHub Pages で公開する

1. `main` に push する
2. GitHub の対象リポジトリで `Settings > Pages` を開く
3. `Source` を `GitHub Actions` にする
4. `Actions` の `Deploy GitHub Pages` が成功したら公開される

公開URL:
[https://attrip.github.io/makeeyecatch/](https://attrip.github.io/makeeyecatch/)

## 今後の拡張候補

- Style 辞書の追加
- タイトル解釈ルールの精度向上
- 履歴表示
- WordPress カスタム HTML 向けの1ファイル版
- 画像生成 API への直接接続
