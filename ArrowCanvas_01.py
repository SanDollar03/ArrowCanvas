from flask import Flask, render_template, jsonify, request
import json
import os

app = Flask(__name__)

POSITIONS_FILE = 'data/positions.json'

# データ保存用ディレクトリを作成
os.makedirs('data', exist_ok=True)

def initialize_positions_file():
    """positions.json を初期化"""
    if not os.path.exists(POSITIONS_FILE):
        with open(POSITIONS_FILE, 'w') as file:
            json.dump([], file)

def load_positions():
    """positions.json を読み込む"""
    if os.path.exists(POSITIONS_FILE):
        try:
            with open(POSITIONS_FILE, 'r') as file:
                data = file.read()
                if data.strip():
                    return json.loads(data)
        except json.JSONDecodeError:
            print("Invalid JSON format. Returning empty list.")
    return []

def save_positions(positions):
    """positions.json に保存"""
    with open(POSITIONS_FILE, 'w') as file:
        json.dump(positions, file)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/positions', methods=['GET', 'POST'])
def positions():
    if request.method == 'GET':
        return jsonify(load_positions())
    elif request.method == 'POST':
        data = request.json
        positions = load_positions()
        positions.append(data)
        save_positions(positions)
        return jsonify({'message': 'Position saved successfully!'})

@app.route('/api/positions/delete', methods=['POST'])
def delete_position():
    """矢印を削除"""
    data = request.json  # 削除対象の座標情報
    positions = load_positions()

    # 該当する矢印を削除
    positions = [pos for pos in positions if not (pos['x'] == data['x'] and pos['y'] == data['y'])]
    save_positions(positions)

    return jsonify({'message': 'Position deleted successfully!'})

if __name__ == '__main__':
    initialize_positions_file()
    app.run(host='0.0.0.0', port=5000, debug=True)