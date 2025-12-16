FROM python:3.11-slim

# Отключаем .pyc и буферизацию логов
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    SETTINGS_PATH=/config/settings.yaml

WORKDIR /app

# Системные зависимости (минимум)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY app ./app

# Копируем settings.yaml в /config
COPY config/ ./config

# Открываем порт
EXPOSE 8000

# Запуск FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
