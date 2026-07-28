from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

BACKEND_URL = 'http://127.0.0.1:4000/api/ai/detect'

@app.get('/health')
def health():
    return jsonify({'status': 'ok'})

@app.post('/detect')
def detect():
    payload = request.get_json(silent=True) or {}
    room_id = payload.get('roomId')
    if not room_id:
        return jsonify({'error': 'roomId is required'}), 400
    response = requests.post(BACKEND_URL, json={'roomId': room_id}, timeout=5)
    response.raise_for_status()
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
