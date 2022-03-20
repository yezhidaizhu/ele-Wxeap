import store from "@/samples/electron-store";
import { TextField, Button } from "@mui/material";
import { useState, useEffect } from "react";

export default function SetEapUrl(props: { alertErr?: Function, alertSuccess?: Function }) {
  const { alertErr = () => { } } = props;

  const [eapUrl, setEapUrl] = useState("");

  const onSetEap = (e: any) => {
    e?.stopPropagation();
    e?.preventDefault();

    let _eapUrl = eapUrl.trim();
    if (!_eapUrl) {
      alertErr("地址不能为空");
    } else if (!/http[s]{0,1}:\/\/([\w.]+\/?)\S*/.test(_eapUrl)) {
      alertErr("地址需要带协议 `http` 或者 `https`");
    } else {
      window.ipcRenderer?.send("setting-msg", { eapUrl });
    }
  };

  useEffect(() => {
    (async () => {
      const eapConfig = await store.get("eapConfig");
      // console.log(userInfo);
      const { eapUrl = "" } = eapConfig || {};
      setEapUrl(eapUrl);
    })()
  }, [])

  return (
    <div className="p-4 py-16">
      <form onSubmit={onSetEap} method='get'>
        <TextField
          onChange={(e) => setEapUrl(e.target.value)}
          value={eapUrl}
          label="eap 地址（请带协议）"
          variant="standard"
          fullWidth />

        <div className="text-center mt-24">
          <Button variant="outlined" onClick={onSetEap}  >确定</Button>
        </div>
      </form>
    </div>
  );
}