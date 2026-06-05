"""
═══════════════════════════════════════════════════════════
   TELEGRAM-АДМИНКА ДЛЯ САЙТА «ГРАНИ СТРАХА»
═══════════════════════════════════════════════════════════

Бот общается с сайтом через HTTP API:
  GET   /api/quests         — получить все квесты
  PATCH /api/quests         — обновить одно поле (заголовок X-Admin-Secret)

Установка (один раз):
  1. Создай бота: напиши @BotFather → /newbot → получи TOKEN
  2. Узнай свой Telegram ID: @userinfobot → получишь число
  3. Установи зависимости:
       pip install -r requirements.txt
  4. Скопируй .env.example → .env, заполни все значения
  5. Запусти сайт: npm run dev (в папке проекта)
  6. Запусти бота: python bot/admin_bot.py

Команды бота:
  /start  — список квестов
  /cancel — отменить редактирование
"""

import os
import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, filters, ContextTypes
)

# ══════════════════════ ЗАГРУЗКА .env ══════════════════════
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(ENV_PATH):
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

TOKEN        = os.getenv("BOT_TOKEN", "").strip()
ADMIN_ID_RAW = os.getenv("ADMIN_ID", "").strip()
SITE_URL     = os.getenv("SITE_URL", "http://localhost:3000").strip()
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "change-me-to-random-string").strip()

if not TOKEN:
    raise SystemExit("Не задан BOT_TOKEN. Заполни bot/.env")
try:
    ADMIN_ID = int(ADMIN_ID_RAW)
except ValueError:
    raise SystemExit("ADMIN_ID должен быть числом (из @userinfobot)")

# ══════════════════════ ПОЛЯ КВЕСТА ══════════════════════
FIELDS = {
    "name":       {"label": "📌 Название",         "type": "text"},
    "desc":       {"label": "📝 Краткое описание", "type": "text"},
    "full":       {"label": "📖 Полное описание",  "type": "text"},
    "basePrice":  {"label": "💰 Базовая цена",     "type": "int",    "hint": "Цена за группу до N человек, например: 5700"},
    "baseUpTo":   {"label": "👥 Группа до",        "type": "int",    "hint": "Кол-во человек в базовой цене, например: 3"},
    "extraPrice": {"label": "➕ Доплата",          "type": "int",    "hint": "За каждого следующего, например: 1900"},
    "players":    {"label": "👤 Игроков (текст)",  "type": "text",   "hint": "Например: 2–6"},
    "time":       {"label": "⏱ Длительность",     "type": "text",   "hint": "Например: 60 мин"},
    "age":        {"label": "🔞 Возраст",          "type": "text",   "hint": "Например: 18+"},
    "fear":       {"label": "😱 Страх (1–5)",      "type": "int"},
    "diff":       {"label": "🧠 Сложность (1–5)",  "type": "int"},
    "rating":     {"label": "⭐ Рейтинг",          "type": "text",   "hint": "Например: 4.9"},
    "reviews":    {"label": "💬 Кол-во отзывов",   "type": "int"},
    "badge":      {"label": "🏷 Бейдж",            "type": "text",   "hint": "Например: Хит, Новинка, Премиум"},
    "cat":        {"label": "📂 Категория",        "type": "choice", "choices": ["extreme", "mystery", "classic"]},
    "icon":       {"label": "🔣 Символ",           "type": "text",   "hint": "Один символ, напр.: ☩ ✦ ⚛ ⚓"},
    "schedule":   {"label": "📅 Расписание",       "type": "text"},
    "atmosphere": {"label": "🌫 Атмосфера",        "type": "list",   "hint": "Каждый пункт с новой строки"},
    "included":   {"label": "✅ Что входит",       "type": "list",   "hint": "Каждый пункт с новой строки"},
    "tags":       {"label": "🏷 Особенности",      "type": "list",   "hint": "Каждый пункт с новой строки"},
}

# ══════════════════════ HTTP ══════════════════════
def api_get_quests():
    r = requests.get(f"{SITE_URL}/api/quests", timeout=10)
    r.raise_for_status()
    return r.json()

def api_get_quest(quest_id: int):
    return next((q for q in api_get_quests() if q["id"] == quest_id), None)

def api_update_field(quest_id: int, field: str, value):
    r = requests.patch(
        f"{SITE_URL}/api/quests",
        json={"id": quest_id, "field": field, "value": value},
        headers={"X-Admin-Secret": ADMIN_SECRET},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()

# ══════════════════════ ПРОВЕРКА ДОСТУПА ══════════════════════
def is_admin(update: Update) -> bool:
    return update.effective_user.id == ADMIN_ID

# ══════════════════════ ХЕНДЛЕРЫ ══════════════════════
async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update):
        await update.message.reply_text("⛔ Доступ запрещён.")
        return
    try:
        quests = api_get_quests()
    except Exception as e:
        await update.message.reply_text(f"❌ Не могу связаться с сайтом ({SITE_URL}):\n{e}")
        return

    keyboard = [
        [InlineKeyboardButton(
            f"{q.get('icon','💀')} {q['name']} — {q.get('basePrice', '?')} ₽",
            callback_data=f"quest:{q['id']}"
        )]
        for q in quests
    ]
    await update.message.reply_text(
        "🎭 *ГРАНИ СТРАХА — Админка*\n\nВыбери квест для редактирования:",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )


async def show_quest_card(query, quest_id):
    q = api_get_quest(quest_id)
    if not q:
        await query.edit_message_text("❌ Квест не найден.")
        return

    desc = q.get("desc", "")
    text = f"*{q.get('icon','💀')} {q['name']}*\n\n"
    text += f"💰 *Цена:* {q.get('basePrice','?')} ₽ до {q.get('baseUpTo','?')} чел · +{q.get('extraPrice','?')} ₽\n"
    text += f"👤 *Игроков:* {q.get('players','')}  ⏱ {q.get('time','')}  🔞 {q.get('age','')}\n"
    text += f"😱 *Страх:* {q.get('fear','')}/5  🧠 *Сложность:* {q.get('diff','')}/5\n"
    text += f"⭐ *Рейтинг:* {q.get('rating','')} ({q.get('reviews','?')} отзывов)\n"
    text += f"🏷 *Бейдж:* {q.get('badge','')}  📂 {q.get('cat','')}\n\n"
    text += f"📝 _{desc[:120]}{'...' if len(desc) > 120 else ''}_\n\n"
    text += "👇 *Жми на поле чтобы изменить:*"

    keyboard, row = [], []
    for field, info in FIELDS.items():
        row.append(InlineKeyboardButton(info["label"], callback_data=f"edit:{quest_id}:{field}"))
        if len(row) == 2:
            keyboard.append(row)
            row = []
    if row:
        keyboard.append(row)
    keyboard.append([InlineKeyboardButton("◀️ К списку квестов", callback_data="back_to_list")])

    await query.edit_message_text(
        text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown"
    )


async def on_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if not is_admin(update):
        await query.edit_message_text("⛔ Доступ запрещён.")
        return

    data = query.data

    if data == "back_to_list":
        try:
            quests = api_get_quests()
        except Exception as e:
            await query.edit_message_text(f"❌ Ошибка связи: {e}")
            return
        keyboard = [
            [InlineKeyboardButton(
                f"{q.get('icon','💀')} {q['name']} — {q.get('basePrice','?')} ₽",
                callback_data=f"quest:{q['id']}"
            )] for q in quests
        ]
        await query.edit_message_text(
            "🎭 *ГРАНИ СТРАХА — Админка*\n\nВыбери квест:",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )
        return

    if data.startswith("quest:"):
        await show_quest_card(query, int(data.split(":")[1]))
        return

    if data.startswith("edit:"):
        _, quest_id, field = data.split(":")
        quest_id = int(quest_id)
        info = FIELDS[field]
        q = api_get_quest(quest_id)
        context.user_data["editing"] = {"quest_id": quest_id, "field": field}

        current = q.get(field, "")
        current_str = "\n".join(current) if isinstance(current, list) else str(current)

        msg = f"✏️ *Редактирование:* {info['label']}\n"
        msg += f"📋 *Текущее значение:*\n```\n{current_str}\n```\n\n"
        if "hint" in info:
            msg += f"💡 _{info['hint']}_\n\n"

        if info["type"] == "choice":
            msg += "Выбери новое значение:"
            keyboard = [
                [InlineKeyboardButton(c, callback_data=f"set_choice:{quest_id}:{field}:{c}")]
                for c in info["choices"]
            ]
            keyboard.append([InlineKeyboardButton("❌ Отмена", callback_data=f"quest:{quest_id}")])
            await query.edit_message_text(msg, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        else:
            msg += "📝 *Отправь новое значение сообщением.*\n_Или /cancel чтобы отменить._"
            await query.edit_message_text(msg, parse_mode="Markdown")
        return

    if data.startswith("set_choice:"):
        _, quest_id, field, value = data.split(":", 3)
        quest_id = int(quest_id)
        try:
            api_update_field(quest_id, field, value)
        except Exception as e:
            await query.answer(f"❌ Ошибка: {e}", show_alert=True)
            return
        await query.answer(f"✅ Сохранено: {value}")
        await show_quest_card(query, quest_id)
        return


async def on_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update):
        return

    editing = context.user_data.get("editing")
    if not editing:
        await update.message.reply_text("Не понимаю. Нажми /start")
        return

    quest_id = editing["quest_id"]
    field = editing["field"]
    info = FIELDS[field]
    raw = update.message.text.strip()

    try:
        if info["type"] == "int":
            value = int(raw.replace(" ", "").replace(",", ""))
        elif info["type"] == "list":
            value = [line.strip() for line in raw.split("\n") if line.strip()]
            if not value:
                raise ValueError("Список не может быть пустым")
        else:
            value = raw
    except ValueError as e:
        await update.message.reply_text(f"❌ Неверный формат. {e}\nПопробуй ещё раз или /cancel")
        return

    try:
        api_update_field(quest_id, field, value)
    except Exception as e:
        await update.message.reply_text(f"❌ Ошибка сохранения:\n{e}")
        return

    context.user_data.pop("editing", None)

    keyboard = [[
        InlineKeyboardButton("◀️ К квесту", callback_data=f"quest:{quest_id}"),
        InlineKeyboardButton("📋 К списку", callback_data="back_to_list"),
    ]]
    await update.message.reply_text(
        f"✅ *Сохранено!*\n\n*{info['label']}* теперь:\n```\n{raw[:300]}\n```",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )


async def cmd_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.user_data.pop("editing", None):
        await update.message.reply_text("❌ Отменено. /start — начать заново.")
    else:
        await update.message.reply_text("Нечего отменять. /start")


def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start",  cmd_start))
    app.add_handler(CommandHandler("quests", cmd_start))
    app.add_handler(CommandHandler("cancel", cmd_cancel))
    app.add_handler(CallbackQueryHandler(on_button))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_text))
    print(f"Бот ГРАНИ СТРАХА запущен. Сайт: {SITE_URL}")
    print("Напиши /start в Telegram.")
    app.run_polling()


if __name__ == "__main__":
    main()
