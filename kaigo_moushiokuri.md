# 介護申し送り翻訳＆アシスタントアプリ（UI/UXデモ）要件定義

## 1. アプリケーション概要

介護現場における申し送り内容を、外国人介護人材にも理解しやすい「やさしい日本語」と、ユーザーが指定した言語へ翻訳するアプリケーション。
テキスト入力および音声入力に対応し、翻訳結果や各種情報をアバターが音声で解説することで、円滑なコミュニケーションを支援する。

### 1.1. 開発目的

* **課題:** 介護の専門用語は、特定技能外国人にとって難解であり、申し送り内容の正確な理解を妨げる一因となっている。
* **目的:** 本アプリは、UI/UXのデモ作成を目的とする。ChatGPT APIを活用し、介護の専門的な申し送り内容を「やさしい日本語」と指定言語に翻訳・解説する機能を提供することで、クライアントに具体的な利用イメージを提示する。

## 2. ターゲットユーザー

* 日本語を母国語とする介護士（申し送りの作成者）
* 外国籍の介護士（申し送りの引継ぎ手）

## 3. 用語整理

| 用語 | 説明 |
| :--- | :--- |
| **ユーザー** | アプリケーション（タブレット端末を想定）を操作する介護スタッフ。 |
| **申し送り作成者** | 主に日本語話者の介護スタッフで、申し送り内容を入力するユーザー。 |
| **申し送り引継ぎ手** | 主に外国籍の介護スタッフで、翻訳・解説された申し送り内容を確認するユーザー。 |
| **アバター** | AIが生成したテキスト（翻訳結果や回答）を、音声合成に合わせて口パク等のアニメーションで読み上げるキャラクター。 |
| **やさしい日本語** | 小学校3年生程度の語彙や文法で構成された、外国人にも分かりやすい日本語。 |
| **プロンプトDB** | ChatGPT APIに指示を出すためのプロンプト（命令文）を格納するデータベース。 |
| **申し送りデータ** | ユーザーによって入力・保存された申し送り情報（日付、担当者、内容など）。 |
| **商品DB** | (Q&A機能で利用) 介護用品などの商品情報を格納するデータベース。 |

## 4. 機能要件

### 4.1. 申し送り翻訳機能

ユーザーが入力した申し送り内容を、「やさしい日本語」と「指定した外国語」に翻訳して表示します。

#### 4.1.1. 申し送り入力フォーム

* **入力項目:**
    * **日付:** `YYYY/MM/DD` 形式（カレンダーUIによる選択）
    * **申し送り作成者:** テキスト入力（サジェスト機能付きを想定）
    * **申し送り引継ぎ手:** テキスト入力（サジェスト機能付きを想定）
    * **翻訳先言語:** プルダウンメニューから選択（例: 英語, ベトナム語, インドネシア語, 中国語）
    * **申し送り内容（原文）:** 複数行のテキスト入力が可能なテキストエリア。
* **アクション:**
    * **音声入力ボタン:** テキストエリアの横に配置。クリックすると音声認識を開始する。（詳細は 4.2）
    * **翻訳実行ボタン:** フォームの最下部に配置。「翻訳する」などのラベル。

#### 4.1.2. 翻訳結果表示

* **表示項目:**
    * **原文:** 入力された申し送り内容をそのまま表示。
    * **やさしい日本語:** 翻訳結果を表示。原文の専門用語には下線や色付けをし、タップすると解説を表示するなどのUIを検討。
    * **指定言語への翻訳:** 選択された言語への翻訳結果を表示。
* **アクション:**
    * **アバターによる読み上げボタン:** 各翻訳結果の横に配置。クリックするとアバターがその内容を音声で読み上げる。（詳細は 4.3）

#### 4.1.3. 翻訳処理フロー

1.  ユーザーがフォームに情報を入力し、「翻訳実行ボタン」をクリックする。
2.  アプリケーションは、プロンプトDBから翻訳用のプロンプトを取得する。
3.  取得したプロンプトと、ユーザーが入力した「申し送り内容（原文）」を組み合わせて、ChatGPT APIにリクエストを送信する。
4.  APIから返却された「やさしい日本語」と「指定言語の翻訳」のテキストを受け取る。
5.  受け取ったテキストを画面上に表示する。
6.  アバターは`animation_q100.webp`を使用してください。

#### 4.1.4. ChatGPTへのプロンプト例

```text
# Role
あなたは、日本の介護現場で働くプロの翻訳家です。介護の専門用語を、外国人が理解できる「やさしい日本語」と指定された言語に翻訳するタスクを実行します。

# Conditions
- 「やさしい日本語」は、JLPT N4レベルの語彙・文法を基準とします。
- 専門用語や、誤解を生む可能性のある表現は、より平易な言葉に置き換えてください。
- 元の文章の重要な情報（誰が、いつ、どこで、何を、なぜ、どのように）が欠落しないように注意してください。
- 出力は必ずJSON形式とします。

# Input
- Target Language: {翻訳先言語}
- Text: {ユーザーが入力した申し送り内容}

# Output Format (JSON)
{
  "easy_japanese": "（ここに、やさしい日本語の翻訳結果を生成）",
  "translated_text": "（ここに、指定言語への翻訳結果を生成）"
}