from flask import Flask, send_from_directory, request, redirect
import os

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def index():
    user_agent = request.headers.get('User-Agent', '').lower()
    if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
        return send_from_directory(BASE_DIR, 'mobile.html')
    return send_from_directory(BASE_DIR, 'web.html')

@app.route('/web.css')
def web_css():
    return send_from_directory(BASE_DIR, 'web.css')

@app.route('/web.js')
def web_js():
    return send_from_directory(BASE_DIR, 'web.js')

@app.route('/mobile.css')
def mobile_css():
    return send_from_directory(BASE_DIR, 'mobile.css')

@app.route('/mobile.js')
def mobile_js():
    return send_from_directory(BASE_DIR, 'mobile.js')

@app.route('/music.mp3')
def music():
    return send_from_directory(BASE_DIR, 'music.mp3')

@app.route('/one.gif')
def gif():
    return send_from_directory(BASE_DIR, 'one.gif')

if __name__ == '__main__':
    print("📁 Папка:", BASE_DIR)
    needed = ['web.html', 'web.css', 'web.js', 'mobile.html', 'mobile.css', 'mobile.js', 'music.mp3', 'one.gif']
    missing = [f for f in needed if not os.path.isfile(os.path.join(BASE_DIR, f))]
    if missing:
        print("❌ Отсутствуют файлы:", missing)
    else:
        print("✅ Все файлы на месте. Запуск сервера...")
        print("📱 Мобильная версия будет автоматически определяться по User-Agent")
    app.run(host='0.0.0.0', port=8000, debug=True)