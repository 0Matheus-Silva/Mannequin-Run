"""Offline text inspection for the ReportLab brief; no third-party dependencies."""
import base64, pathlib, re, zlib
path=pathlib.Path(__file__).resolve().parents[1]/'MANNEQUIN_RUN_Codex_Visual_Package/MANNEQUIN_RUN_Brief_Visual.pdf'
data=path.read_bytes()
print('PDF pages:',len(re.findall(rb'/Type\s*/Page\b',data)))
def unescape(value):
    value=re.sub(rb'\\([0-7]{1,3})',lambda m:bytes([int(m[1],8)]),value)
    return re.sub(rb'\\(.)',lambda m:{b'n':b'\n',b'r':b'\r',b't':b'\t'}.get(m[1],m[1]),value).decode('cp1252','replace')
for n,match in enumerate(re.finditer(rb'(\d+)\s+\d+\s+obj(.*?)endobj',data,re.S)):
    obj=match[2]
    stream=re.search(rb'stream\r?\n(.*?)\r?\n?endstream',obj,re.S)
    if not stream:continue
    value=stream[1]
    try:
        if b'ASCII85Decode' in obj:value=base64.a85decode(value.strip(),adobe=value.strip().endswith(b'~>'))
        if b'FlateDecode' in obj:value=zlib.decompress(value)
    except Exception:continue
    if b'BT' not in value:continue
    print('\n--- TEXT STREAM',match[1].decode(),'---')
    for text in re.findall(rb'\(((?:\\.|[^()\\])*)\)\s*Tj',value):print(unescape(text))
