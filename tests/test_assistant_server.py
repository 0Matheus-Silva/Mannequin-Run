import importlib.util
import io
import json
from pathlib import Path
import threading
import unittest
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("assistant_server", ROOT / "server/assistant_server.py")
server_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server_module)


class BrokerTests(unittest.TestCase):
    def test_personality_and_complete_knowledge_reach_live_setup(self):
        text = server_module.live_setup()["systemInstruction"]["parts"][0]["text"]
        self.assertIn("português brasileiro", text)
        self.assertIn("sarcasmo leve", text)
        self.assertIn("uma a três frases", text)
        facts = json.loads((ROOT / "assets/assistant/knowledge.json").read_text(encoding="utf-8"))
        for value in facts.values():
            self.assertIn(value, text)

    def env(self):
        return {"GEMINI_ENABLED": "true", "GEMINI_AUDIENCE_REVIEW": "approved-adults-only", "GEMINI_FREE_TIER_CONFIRMED": "true", "GEMINI_API_KEY": "dummy-test-only"}

    def test_disabled_never_contacts_provider(self):
        def forbidden(*_, **__):
            self.fail("Contato externo não autorizado")
        self.assertEqual(server_module.Broker({}, forbidden).issue()[0], 403)

    def test_all_operational_gates_required(self):
        for key in self.env():
            env = self.env()
            del env[key]
            self.assertFalse(server_module.readiness(env)[0])

    def test_short_single_use_constrained_token(self):
        body = server_module.token_payload()
        self.assertEqual(body["uses"], 1)
        self.assertEqual(body["liveConnectConstraints"]["model"], "models/gemini-3.8-live")
        self.assertIn("newSessionExpireTime", body)
        self.assertEqual(server_module.live_setup()["generationConfig"]["speechConfig"]["voiceConfig"]["prebuiltVoiceConfig"]["voiceName"], "Sadachbia")

    def test_mock_token_has_no_permanent_secret(self):
        requests = []
        def fake(request, timeout):
            requests.append(request)
            return io.BytesIO(b'{"name":"auth_tokens/mock-only"}')
        broker = server_module.Broker(self.env(), fake)
        status, result = broker.issue()
        self.assertEqual(status, 200)
        self.assertNotIn("dummy-test-only", json.dumps(result))
        self.assertEqual(requests[0].full_url, server_module.TOKEN_ENDPOINT)
        self.assertEqual(broker.issue()[0], 429)

    def test_quota_has_no_paid_fallback_or_retry(self):
        calls = []
        def fake(request, timeout):
            calls.append(request)
            raise urllib.error.HTTPError(request.full_url, 429, "quota", {}, None)
        broker = server_module.Broker(self.env(), fake)
        self.assertEqual(broker.issue()[0], 429)
        self.assertEqual(broker.issue()[0], 429)
        self.assertEqual(len(calls), 1)

    def test_network_failure_sanitized(self):
        def fake(*_, **__):
            raise OSError("dummy-test-only private detail")
        status, body = server_module.Broker(self.env(), fake).issue()
        self.assertEqual(status, 503)
        self.assertNotIn("dummy-test-only", json.dumps(body))


class HTTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.broker = server_module.Broker({})
        cls.server = server_module.http.server.ThreadingHTTPServer(("127.0.0.1", 0), server_module.handler_for(cls.broker))
        cls.base = "http://127.0.0.1:" + str(cls.server.server_address[1])
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def code(self, request):
        try:
            with urllib.request.urlopen(request) as response:
                return response.status
        except urllib.error.HTTPError as error:
            status = error.code
            error.close()
            return status

    def test_configuration_is_disabled_and_secretless(self):
        with urllib.request.urlopen(self.base + "/api/assistant/config") as response:
            config = json.load(response)
        self.assertFalse(config["ready"])
        self.assertNotIn("apiKey", config)

    def test_real_local_static_audio(self):
        with urllib.request.urlopen(self.base + "/assets/assistant/presentation.wav") as response:
            self.assertEqual(response.headers["Content-Type"], "audio/wav")
            self.assertEqual(response.read(4), b"RIFF")

    def test_secrets_and_source_backend_not_served(self):
        for path in ["/.env", "/.env.example", "/server/assistant_server.py", "/.git/config", "/%2e%2e/README.md"]:
            self.assertEqual(self.code(self.base + path), 404)

    def test_foreign_host_rejected(self):
        self.assertEqual(self.code(urllib.request.Request(self.base, headers={"Host": "evil.example"})), 403)

    def test_cross_origin_mint_rejected(self):
        request = urllib.request.Request(self.base + "/api/assistant/token", data=b"{}", headers={"Origin": "http://evil.example", "X-Assistant-CSRF": self.broker.csrf})
        self.assertEqual(self.code(request), 403)

    def test_same_origin_still_blocked_without_configuration(self):
        request = urllib.request.Request(self.base + "/api/assistant/token", data=b"{}", headers={"Origin": self.base, "X-Assistant-CSRF": self.broker.csrf})
        self.assertEqual(self.code(request), 403)


if __name__ == "__main__":
    unittest.main(verbosity=2)
