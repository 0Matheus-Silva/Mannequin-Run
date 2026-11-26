"""Loopback-only static server and opt-in ephemeral-token broker. No third-party packages."""
import argparse
import datetime as dt
import http.server
import json
import mimetypes
import os
from pathlib import Path
import secrets
import threading
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
LIVE_CONFIG = json.loads((ROOT / "assets/assistant/live-config.json").read_text(encoding="utf-8"))
MODEL = LIVE_CONFIG["model"]
VOICE = LIVE_CONFIG["voice"]
TOKEN_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/auth_tokens"


def environment(root=ROOT):
    values = {}
    path = root / ".env"
    if path.exists():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            key, separator, value = line.strip().partition("=")
            if separator and key and not key.startswith("#"):
                values[key.strip()] = value.strip().strip('"\'')
    values.update(os.environ)
    return values


def readiness(env):
    if env.get("GEMINI_ENABLED") != "true":
        return False, "Gemini desativada. Use a demonstração local; a equipe precisa revisar público e configuração."
    if env.get("GEMINI_AUDIENCE_REVIEW") != "approved-adults-only":
        return False, "Público ainda não revisado pela equipe. Não habilitar onde menores possam acessar."
    if env.get("GEMINI_FREE_TIER_CONFIRMED") != "true":
        return False, "Cota gratuita e faturamento desativado precisam ser conferidos pela equipe."
    if not env.get("GEMINI_API_KEY"):
        return False, "Chave da API não configurada no backend local."
    return True, "Configuração local liberada pela equipe; o visitante ainda deve aceitar o processamento externo."


def live_setup(root=ROOT):
    facts = json.loads((root / "assets/assistant/knowledge.json").read_text(encoding="utf-8"))
    personality = json.loads((root / "assets/assistant/personality.json").read_text(encoding="utf-8"))
    return {
        "model": "models/" + MODEL,
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {
            "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}},
        "systemInstruction": {"parts": [{"text": personality["instruction"] + "\nBASE OFICIAL:\n" + json.dumps(facts, ensure_ascii=False)}]},
        "inputAudioTranscription": {}, "outputAudioTranscription": {},
    }


def token_payload(now=None):
    now = now or dt.datetime.now(dt.timezone.utc)
    stamp = lambda value: value.isoformat().replace("+00:00", "Z")
    return {"uses": 1, "expireTime": stamp(now + dt.timedelta(seconds=180)),
            "newSessionExpireTime": stamp(now + dt.timedelta(seconds=30)),
            "bidiGenerateContentSetup": live_setup()}


class Broker:
    def __init__(self, env, opener=urllib.request.urlopen):
        self.env = env
        self.opener = opener
        self.csrf = secrets.token_urlsafe(32)

    def issue(self, slot="principal"):
        keys = {"principal": "GEMINI_API_KEY", "reserva1": "GEMINI_API_KEY_2", "reserva2": "GEMINI_API_KEY_3"}
        ready, reason = readiness(self.env)
        if not ready:
            return 403, {"error": reason}
        if not isinstance(slot, str) or slot not in keys or not self.env.get(keys[slot]):
            return 400, {"error": "Chave selecionada não cadastrada no servidor."}
        request = urllib.request.Request(TOKEN_ENDPOINT, data=json.dumps(token_payload()).encode(), method="POST",
                                         headers={"Content-Type": "application/json", "x-goog-api-key": self.env[keys[slot]]})
        try:
            with self.opener(request, timeout=12) as response:
                token = json.loads(response.read(65536))
            if not isinstance(token.get("name"), str) or not token["name"].startswith("auth_tokens/"):
                return 502, {"error": "Token inválido do provedor."}
            return 200, {"token": token["name"], "setup": live_setup(), "expiresIn": 180}
        except urllib.error.HTTPError as error:
            status = 429 if error.code == 429 else 503
            error.close()
            return status, {"code": "provider_quota" if status == 429 else "provider_unavailable",
                            "error": "O Google recusou a solicitação por cota ou limite de requisições. Escolha uma reserva cadastrada e reconecte, ou confira o projeto no AI Studio." if status == 429 else "Provedor indisponível; nenhum detalhe de credencial é exposto."}
        except (OSError, ValueError, KeyError):
            return 503, {"error": "Provedor indisponível. Use a demonstração local."}


def handler_for(broker, root=ROOT):
    class Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass  # No transcripts, request bodies, credentials or tokens in logs.

        def trusted(self):
            port = self.server.server_address[1]
            hosts = {f"127.0.0.1:{port}", f"localhost:{port}"}
            return self.headers.get("Host") in hosts

        def respond(self, status, value):
            data = json.dumps(value, ensure_ascii=False).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(data)

        def do_HEAD(self):
            self.do_GET()

        def do_GET(self):
            if not self.trusted():
                return self.respond(403, {"error": "Host não autorizado."})
            path = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
            if path == "/api/assistant/config":
                ready, reason = readiness(broker.env)
                return self.respond(200, {"ready": ready, "reason": reason, "csrf": broker.csrf, "model": MODEL, "voice": VOICE, "keySlots": [slot for slot, key in (("principal", "GEMINI_API_KEY"), ("reserva1", "GEMINI_API_KEY_2"), ("reserva2", "GEMINI_API_KEY_3")) if broker.env.get(key)]})
            try:
                relative = path.lstrip("/") or "index.html"
                target = (root / relative).resolve()
                parts = target.relative_to(root).parts
                allowed = parts[0] in {"assets", "src", "styles", "tests"} or relative == "index.html"
                if not allowed or any(p.startswith(".") for p in parts) or target.suffix.lower() not in {".html", ".js", ".css", ".json", ".png", ".jpg", ".jpeg", ".svg", ".wav"} or not target.is_file():
                    return self.respond(404, {"error": "Não encontrado."})
                data = target.read_bytes()
            except (OSError, ValueError):
                return self.respond(404, {"error": "Não encontrado."})
            self.send_response(200)
            mime = {".js": "text/javascript", ".css": "text/css", ".wav": "audio/wav"}.get(target.suffix, mimetypes.guess_type(str(target))[0] or "application/octet-stream")
            self.send_header("Content-Type", mime)
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(data)

        def do_POST(self):
            port = self.server.server_address[1]
            if not self.trusted() or self.headers.get("Origin") not in {f"http://localhost:{port}", f"http://127.0.0.1:{port}"} or not secrets.compare_digest(self.headers.get("X-Assistant-CSRF", ""), broker.csrf):
                return self.respond(403, {"error": "Origem não autorizada."})
            if self.path != "/api/assistant/token":
                return self.respond(404, {"error": "Rota inexistente."})
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if length < 0 or length > 1024:
                    return self.respond(413, {"error": "Requisição grande demais."})
                payload = json.loads(self.rfile.read(length) or b"{}")
                if not isinstance(payload, dict):
                    return self.respond(400, {"error": "Requisição inválida."})
            except ValueError:
                return self.respond(400, {"error": "Requisição inválida."})
            status, value = broker.issue()
            self.respond(status, value)
    return Handler


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8081)
    args = parser.parse_args()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", args.port), handler_for(Broker(environment())))
    print(f"NEXUS RUN + assistente: http://localhost:{args.port} — Gemini desativada por padrão.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
