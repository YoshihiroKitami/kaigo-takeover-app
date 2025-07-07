
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises; // ファイル読み込みのため追加

const app = express();
const port = process.env.PORT || 3000;

// APIキーのチェック
if (!process.env.GEMINI_API_KEY) {
  console.error('エラー: GEMINI_API_KEYが.envファイルに設定されていません。');
  process.exit(1);
}

// Google AIクライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// ミドルウェアの設定
app.use(express.json());
app.use(express.static(__dirname)); // プロジェクトルートの静的ファイルを提供

// 翻訳APIエンドポイント
app.post('/api/translate', async (req, res) => {
  try {
    const { originalText, targetLanguage, systemPrompt } = req.body;

    if (!originalText || !targetLanguage || !systemPrompt) {
      return res.status(400).json({ error: '必須パラメータが不足しています。' });
    }

    const userPrompt = `
# 指示
以下のテキストを、指定された言語に翻訳し、ふりがな付き日本語とやさしい日本語を生成してください。

# 入力テキスト
${originalText}

# 翻訳先の言語
${targetLanguage}
`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "はい、承知いたしました。介護現場のコミュニケーションを支援するAIアシスタントとして、ご指定の形式で回答を生成します。" }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    });

    const result = await chat.sendMessage(userPrompt);
    const response = await result.response;
    const text = response.text();

    // AIの出力からJSON部分を抽出
    const jsonString = text.match(/```json\n([\s\S]*?)\n```/)[1];
    const parsedJson = JSON.parse(jsonString);

    res.json(parsedJson);

  } catch (error) {
    console.error('APIエラー:', error);
    res.status(500).json({ error: '翻訳中にサーバーでエラーが発生しました。' });
  }
});

// 申し送り記録作成APIエンドポイント（新規追加）
app.post('/api/create-record', async (req, res) => {
  try {
    const { originalText, targetLanguage, date, creator, receiver } = req.body;

    if (!originalText || !targetLanguage || !date || !creator || !receiver) {
      return res.status(400).json({ error: '必須パラメータが不足しています。' });
    }
    
    // 新しいプロンプトファイルを読み込む
    let systemPrompt = await fs.readFile('prompt-record.md', 'utf-8');
    
    // プロンプト内のプレースホルダーを実際の値に置換
    systemPrompt = systemPrompt
      .replace('{{日付}}', date)
      .replace('{{担当者}}', creator)
      .replace('{{引継ぎ担当者}}', receiver)
      .replace(/{{引継ぎ言語名}}/g, targetLanguage) // グローバル置換
      .replace('{{原文の申し送り内容}}', originalText);

    const userPrompt = `
申し送り内容: "${originalText}"
引継ぎ言語: ${targetLanguage}
日付: ${date}
担当者: ${creator}
引継ぎ担当者: ${receiver}

上記の情報を元に、指定された構造の介護申し送り記録を作成してください。
`;

    const result = await model.generateContent([systemPrompt, userPrompt]);
    const response = await result.response;
    const recordText = response.text();

    res.json({ recordText });

  } catch (error) {
    console.error('APIエラー (create-record):', error);
    res.status(500).json({ error: '記録の作成中にサーバーでエラーが発生しました。' });
  }
});

app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で起動しました`);
});
