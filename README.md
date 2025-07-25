# 介護申し送り翻訳＆アシスタントアプリ

介護現場の申し送り内容を、外国人介護人材にも分かりやすい「ふりがな付き日本語」「やさしい日本語」、そして指定言語へ翻訳するアプリケーションです。

## 特徴

-   **3種類の出力:** 原文、ふりがな付き、やさしい日本語、指定言語翻訳を一覧表示。
-   **安全なAPI利用:** APIキーをサーバーサイドで管理し、フロントエンドに漏洩させません。
-   **プロンプトカスタマイズ:** ブラウザからAIへの指示（システムプロンプト）を自由に編集・保存できます。

## セットアップ手順

### 1. 必要なもの

-   [Node.js](https://nodejs.org/) (v18以上を推奨)
-   npm (Node.jsに付属)
-   Google Gemini APIキー

### 2. インストール

プロジェクトのルートディレクトリで、以下のコマンドを実行して必要なパッケージをインストールします。

```bash
npm install
```

### 3. APIキーの設定

プロジェクトルートにある `.env.example` ファイルをコピーして、`.env` という名前の新しいファイルを作成します。

作成した `.env` ファイルを開き、`YOUR_GEMINI_API_KEY_HERE` の部分を、あなたが取得した本物のGoogle Gemini APIキーに置き換えてください。

```
# .env ファイルの中身
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. サーバーの起動

以下のコマンドでサーバーを起動します。

```bash
npm start
```

コンソールに「サーバーが http://localhost:3000 で起動しました」と表示されたら成功です。

### 5. アプリケーションへのアクセス

お使いのWebブラウザで、以下のアドレスにアクセスしてください。

http://localhost:3000

これでアプリケーションを使用できます。
