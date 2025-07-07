document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const translateBtn = document.getElementById('translate-btn');
    const createRecordBtn = document.getElementById('create-record-btn'); // 新規
    const originalTextarea = document.getElementById('original-text');
    const targetLangSelect = document.getElementById('target-lang');
    
    // 入力フィールド（新規）
    const dateInput = document.getElementById('date');
    const creatorInput = document.getElementById('creator');
    const receiverInput = document.getElementById('receiver');
    
    const loadingSpinner = document.getElementById('loading-spinner');
    const loadingText = document.getElementById('loading-text'); // 新規
    
    // 既存の翻訳結果エリア
    const translationResultArea = document.getElementById('translation-result-area');
    const originalDisplay = document.getElementById('original-display');
    const furiganaDisplay = document.getElementById('furigana-display');
    const yasashiiDisplay = document.getElementById('yasashii-display');
    const translatedDisplay = document.getElementById('translated-display');

    // 新規の記録結果エリア
    const recordResultArea = document.getElementById('record-result-area');
    const recordDisplay = document.getElementById('record-display');
    const copyRecordBtn = document.getElementById('copy-record-btn'); // コピーボタン

    // 翻訳結果のコピーボタン（新規追加）
    const copyFuriganaBtn = document.getElementById('copy-furigana-btn');
    const copyYasashiiBtn = document.getElementById('copy-yasashii-btn');
    const copyTranslatedBtn = document.getElementById('copy-translated-btn');

    const promptSettingsBtn = document.getElementById('prompt-settings-btn');
    const promptModal = document.getElementById('prompt-modal');
    const promptTextarea = document.getElementById('prompt-textarea');
    const savePromptBtn = document.getElementById('save-prompt-btn');
    const closePromptBtn = document.getElementById('close-prompt-btn');

    let systemPrompt = '';

    // --- Functions ---

    // かんたん翻訳処理
    async function handleTranslation() {
        const originalText = originalTextarea.value.trim();
        const targetLanguage = targetLangSelect.value;

        if (!originalText) {
            alert('申し送り内容を入力してください。');
            return;
        }

        setLoading(true, 'かんたん翻訳を作成中...');
        // 結果表示エリアを切り替え
        recordResultArea.classList.add('hidden');
        translationResultArea.classList.remove('hidden');

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalText,
                    targetLanguage,
                    systemPrompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'サーバーでエラーが発生しました。');
            }

            const result = await response.json();
            displayResults(originalText, result);

        } catch (error) {
            console.error('翻訳エラー:', error);
            alert(`翻訳に失敗しました: ${error.message}`);
            displayError(error.message);
        } finally {
            setLoading(false);
        }
    }

    // 申し送り記録作成処理（新規）
    async function handleRecordCreation() {
        const originalText = originalTextarea.value.trim();
        if (!originalText) {
            alert('申し送り内容を入力してください。');
            return;
        }

        const date = dateInput.value;
        const creator = creatorInput.value.trim();
        const receiver = receiverInput.value.trim();

        if (!date || !creator || !receiver) {
            alert('日付、担当者、引継ぎ手を全て入力してください。');
            return;
        }

        setLoading(true, '申し送り記録を作成中...');
        // 結果表示エリアを切り替え
        translationResultArea.classList.add('hidden');
        recordResultArea.classList.remove('hidden');

        try {
            const response = await fetch('/api/create-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalText,
                    targetLanguage: targetLangSelect.value,
                    date,
                    creator,
                    receiver
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'サーバーエラー');
            }

            const result = await response.json();
            recordDisplay.textContent = result.recordText;

        } catch (error) {
            console.error('記録作成エラー:', error);
            recordDisplay.textContent = `記録の作成に失敗しました: ${error.message}`;
        } finally {
            setLoading(false);
        }
    }
    
    // ローディング状態の切り替え（更新）
    function setLoading(isLoading, message = 'AIが考えています...') {
        loadingText.textContent = message;
        if (isLoading) {
            translateBtn.disabled = true;
            createRecordBtn.disabled = true;
            translateBtn.textContent = '処理中...';
            createRecordBtn.textContent = '処理中...';
            translationResultArea.classList.add('hidden');
            recordResultArea.classList.add('hidden');
            loadingSpinner.style.display = 'flex';
        } else {
            translateBtn.disabled = false;
            createRecordBtn.disabled = false;
            translateBtn.textContent = 'かんたん翻訳';
            createRecordBtn.textContent = '申し送り記録を作成';
            loadingSpinner.style.display = 'none';
        }
    }
    
    // 翻訳結果の表示
    function displayResults(original, result) {
        originalDisplay.textContent = original;
        furiganaDisplay.textContent = result.furigana_text || '生成されませんでした。';
        yasashiiDisplay.textContent = result.yasashii_nihongo_text || '生成されませんでした。';
        translatedDisplay.textContent = result.translated_text || '生成されませんでした。';
    }

    // エラーメッセージの表示
    function displayError(message) {
        originalDisplay.textContent = originalTextarea.value.trim();
        furiganaDisplay.textContent = `エラー: ${message}`;
        yasashiiDisplay.textContent = `エラー: ${message}`;
        translatedDisplay.textContent = `エラー: ${message}`;
    }

    // システムプロンプトの読み込み
    async function loadSystemPrompt() {
        const savedPrompt = localStorage.getItem('systemPrompt');
        if (savedPrompt) {
            systemPrompt = savedPrompt;
            promptTextarea.value = systemPrompt;
        } else {
            try {
                const response = await fetch('prompt.md');
                if (!response.ok) throw new Error('Failed to load default prompt.');
                const defaultPrompt = await response.text();
                systemPrompt = defaultPrompt;
                promptTextarea.value = systemPrompt;
                localStorage.setItem('systemPrompt', systemPrompt);
            } catch (error) {
                console.error(error);
                alert('デフォルトのプロンプト読み込みに失敗しました。');
                systemPrompt = 'あなたは翻訳アシスタントです。'; // Fallback
                promptTextarea.value = systemPrompt;
            }
        }
    }

    // コピー機能（新規）
    async function copyRecordToClipboard() {
        try {
            const recordText = recordDisplay.textContent;
            if (!recordText || recordText.trim() === '') {
                alert('コピーする記録がありません。');
                return;
            }

            await navigator.clipboard.writeText(recordText);
            
            // ボタンの表示を一時的に変更してフィードバック
            const originalText = copyRecordBtn.textContent;
            copyRecordBtn.textContent = '✅ コピー完了';
            copyRecordBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            copyRecordBtn.classList.add('bg-green-500');
            
            setTimeout(() => {
                copyRecordBtn.textContent = originalText;
                copyRecordBtn.classList.remove('bg-green-500');
                copyRecordBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
            }, 2000);

        } catch (error) {
            console.error('コピーエラー:', error);
            alert('コピーに失敗しました。ブラウザがクリップボードAPIに対応していない可能性があります。');
        }
    }

    // 翻訳結果コピー機能（新規追加）
    async function copyToClipboard(element, button, itemName) {
        try {
            const text = element.textContent;
            if (!text || text.trim() === '' || text.includes('生成されませんでした')) {
                alert(`コピーする${itemName}がありません。`);
                return;
            }

            await navigator.clipboard.writeText(text);
            
            // ボタンの表示を一時的に変更してフィードバック
            const originalText = button.textContent;
            button.textContent = '✅ 完了';
            button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            button.classList.add('bg-green-500');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('bg-green-500');
                button.classList.add('bg-blue-500', 'hover:bg-blue-600');
            }, 1500);

        } catch (error) {
            console.error('コピーエラー:', error);
            alert(`${itemName}のコピーに失敗しました。`);
        }
    }

    // --- Event Listeners ---
    translateBtn.addEventListener('click', handleTranslation); // 既存
    createRecordBtn.addEventListener('click', handleRecordCreation); // 新規
    copyRecordBtn.addEventListener('click', copyRecordToClipboard); // 記録コピー

    // 翻訳結果コピーボタン（新規追加）
    copyFuriganaBtn.addEventListener('click', () => copyToClipboard(furiganaDisplay, copyFuriganaBtn, 'ふりがな付き日本語'));
    copyYasashiiBtn.addEventListener('click', () => copyToClipboard(yasashiiDisplay, copyYasashiiBtn, 'やさしい日本語'));
    copyTranslatedBtn.addEventListener('click', () => copyToClipboard(translatedDisplay, copyTranslatedBtn, '翻訳結果'));

    promptSettingsBtn.addEventListener('click', () => promptModal.classList.remove('hidden'));
    closePromptBtn.addEventListener('click', () => promptModal.classList.add('hidden'));
    savePromptBtn.addEventListener('click', () => {
        systemPrompt = promptTextarea.value;
        localStorage.setItem('systemPrompt', systemPrompt);
        promptModal.classList.add('hidden');
        alert('プロンプトを保存しました。');
    });

    // --- Initialization ---
    document.getElementById('date').valueAsDate = new Date();
    loadSystemPrompt();
});
