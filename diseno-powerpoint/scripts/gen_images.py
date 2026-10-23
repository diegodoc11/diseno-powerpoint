# Genera en paralelo las imágenes de apoyo de un deck con Kie AI (google/nano-banana, ~$0.02 c/u).
# Los prompts viven en images.json, con la paleta del deck y el lugar libre para el texto:
#   {
#     "style": {"people": "cinematic editorial photograph, ... deep black background with subtle wine tones, ...",
#               "still":  "fine-art still life photograph, ..."},
#     "images": {"portada": {"ar": "16:9", "style": "people",
#                            "prompt": "Elegant woman in her 50s on the right third, the left two thirds dark and empty for text"}}
#   }
# Al final de cada prompt se agrega el estilo y "no text, no words, no letters, no logos, no watermark".
# Uso: python -X utf8 gen_images.py images.json [nombre1 nombre2 ...]   (sin nombres = las que falten en img/)
import concurrent.futures as cf
import json
import os
import sys
import time
import urllib.request

KEY = os.environ.get("KIE_API_KEY")
if not KEY:
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as k:
            KEY = winreg.QueryValueEx(k, "KIE_API_KEY")[0]
    except OSError:
        sys.exit("Falta KIE_API_KEY (https://kie.ai/api-key)")

CFG_PATH = sys.argv[1] if len(sys.argv) > 1 else "images.json"
CFG = json.load(open(CFG_PATH, encoding="utf-8"))
OUT = os.path.join(os.path.dirname(os.path.abspath(CFG_PATH)), "img")
os.makedirs(OUT, exist_ok=True)
MODEL = CFG.get("model", "google/nano-banana")
NEG = "no text, no words, no letters, no logos, no watermark"


def call(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                                 headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
                                 method="POST" if body else "GET")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def gen(name):
    spec = CFG["images"][name]
    prompt = f"{spec['prompt']}, {CFG.get('style', {}).get(spec.get('style', ''), '')}, {NEG}"
    out = os.path.join(OUT, name + ".png")
    body = {"model": MODEL, "input": {"prompt": prompt, "aspect_ratio": spec.get("ar", "16:9"),
                                      "image_size": spec.get("ar", "16:9"), "output_format": "png"}}
    err = ""
    for _ in range(2):
        try:
            r = call("https://api.kie.ai/api/v1/jobs/createTask", body)
            if not r.get("data") or not r["data"].get("taskId"):
                raise RuntimeError(f"createTask: {r}")
            tid, t0 = r["data"]["taskId"], time.time()
            while time.time() - t0 < 240:
                time.sleep(4)
                rec = call(f"https://api.kie.ai/api/v1/jobs/recordInfo?taskId={tid}")["data"]
                if rec["state"] == "success":
                    urllib.request.urlretrieve(json.loads(rec["resultJson"])["resultUrls"][0], out)
                    return f"OK {name} credits={rec.get('creditsConsumed')}"
                if rec["state"] == "fail":
                    raise RuntimeError(f"fail {rec.get('failCode')} {rec.get('failMsg')}")
            raise RuntimeError("timeout")
        except Exception as e:  # reintenta una vez
            err = f"ERR {name}: {e}"
            time.sleep(3)
    return err


if __name__ == "__main__":
    names = sys.argv[2:] or [n for n in CFG["images"] if not os.path.exists(os.path.join(OUT, n + ".png"))]
    with cf.ThreadPoolExecutor(8) as ex:
        for res in ex.map(gen, names):
            print(res, flush=True)
