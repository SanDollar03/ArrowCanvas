document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const formOverlay = document.getElementById('form-overlay');
    const deleteOverlay = document.getElementById('delete-overlay');
    const form = document.getElementById('arrow-form');
    const okButton = document.getElementById('ok-button');
    const cancelButton = document.getElementById('cancel-button');
    const deleteButton = document.getElementById('delete-button');
    const deleteCancelButton = document.getElementById('delete-cancel-button');
    const angleSlider = document.getElementById('angle-slider');
    const angleValue = document.getElementById('angle-value');
    const arrowPreview = document.getElementById('arrow-preview');

    let tempPosition = { x: 0, y: 0 }; // 一時的に保存する位置データ
    let deleteTarget = null; // 削除対象の矢印要素

    // 初期位置を取得して描画
    fetch('/api/positions')
        .then(response => response.json())
        .then(positions => {
            positions.forEach(pos => addArrow(pos.x, pos.y, pos.angle, pos.url));
        });

    // ダブルクリックで新規配置用フォームを表示
    container.addEventListener('dblclick', (e) => {
        const rect = container.getBoundingClientRect();
        tempPosition.x = e.clientX - rect.left;
        tempPosition.y = e.clientY - rect.top;

        // 初期値設定
        angleSlider.value = 0;
        angleValue.textContent = "0°";
        arrowPreview.style.transform = `rotate(0deg)`;

        // フォーム表示
        formOverlay.style.display = 'flex';
    });

    // スライダーの値をリアルタイムでプレビューに反映
    angleSlider.addEventListener('input', () => {
        const angle = angleSlider.value;
        angleValue.textContent = `${angle}°`;
        arrowPreview.style.transform = `rotate(${angle}deg)`;
    });

    // OKボタンで矢印を追加
    okButton.addEventListener('click', () => {
        const url = form.url.value;
        const angle = parseInt(angleSlider.value, 10);

        // 矢印を描画
        addArrow(tempPosition.x, tempPosition.y, angle, url);

        // サーバーにデータ送信
        fetch('/api/positions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                x: tempPosition.x,
                y: tempPosition.y,
                angle,
                url,
            }),
        });

        // フォームを閉じる
        formOverlay.style.display = 'none';
        form.reset();
    });

    // キャンセルボタン
    cancelButton.addEventListener('click', () => {
        formOverlay.style.display = 'none';
        form.reset();
    });

    // 削除ボタン
    deleteButton.addEventListener('click', () => {
        if (deleteTarget) {
            const x = deleteTarget.getAttribute('data-x');
            const y = deleteTarget.getAttribute('data-y');

            // サーバーに削除リクエストを送信
            fetch('/api/positions/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ x: parseFloat(x), y: parseFloat(y) }),
            }).then(response => {
                if (response.ok) {
                    deleteTarget.remove();
                    deleteTarget = null;
                    console.log('Arrow deleted successfully!');
                }
            });
        }

        // 削除フォームを閉じる
        deleteOverlay.style.display = 'none';
    });

    // 削除キャンセルボタン
    deleteCancelButton.addEventListener('click', () => {
        deleteOverlay.style.display = 'none';
        deleteTarget = null;
    });

    // 矢印を追加する関数
    function addArrow(x, y, angle, url) {
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.style.left = `${x}px`;
        arrow.style.top = `${y}px`;
        arrow.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        arrow.setAttribute('data-x', x);
        arrow.setAttribute('data-y', y);

        // シングルクリックでリンク移動
        arrow.addEventListener('click', () => {
            window.open(url, '_blank');
        });

        // 右クリックで削除フォーム表示
        arrow.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // デフォルトの右クリックメニューを無効化
            deleteTarget = arrow;

            // 削除フォームを表示
            deleteOverlay.style.display = 'flex';
        });

        container.appendChild(arrow);
    }
});
