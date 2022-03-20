import { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import LinearProgress from "@mui/material/LinearProgress";
import { Button } from "@mui/material";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import store from '@/samples/electron-store';

export default function Login() {
  const [checkedIndex, setCheckedIndex] = useState(1);
  const [openForgot, setOpenForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswd, setShowPasswd] = useState(false);
  const [eapUrl, setEapUrl] = useState("");

  const [userInfo, setUserInfo] = useState({ // 登录信息
    name: "",
    passwd: "",
    keep: true,
  });

  const setInfo = (obj: any) => setUserInfo({ ...userInfo, ...obj });

  const handleClose = () => setOpenForgot(false);

  const onLogin = () => {
    window.ipcRenderer?.send("login-msg", userInfo);
    setLoading(true);
  };

  useEffect(() => {
    window.ipcRenderer?.on("login-reply", (event, arg) => {
      setLoading(false);
    });
    return () => {
      window.ipcRenderer.removeAllListeners("login-reply");
    }
  }, [])

  useEffect(() => {
    (async () => {
      const userInfo = await store.get("userInfo");
      // console.log(userInfo);
      const { name = "", passwd = "" } = userInfo || {};
      setInfo({ name, passwd });
      const eapConfig = await store.get("eapConfig");
      // console.log(userInfo);
      const { eapUrl = "" } = eapConfig || {};
      setEapUrl(eapUrl);
    })()
  }, [])

  return (
    <div className="login-wrap">
      <div
        className={`absolute top-0 left-0 w-full z-10 ${!loading && "opacity-0"
          }`}
      >
        <LinearProgress />
      </div>

      <div className="login-html">
        <input
          id="tab-1"
          type="radio"
          name="tab"
          className="sign-in"
          readOnly
          checked={checkedIndex === 1}
        />
        <label
          htmlFor="tab-1"
          className="tab"
          onClick={() => {
            setCheckedIndex(1);
          }}
        >
          Sign In
        </label>
        <input
          id="tab-2"
          type="radio"
          name="tab"
          className="sign-up"
          readOnly
          checked={checkedIndex === 2}
        />
        <label
          htmlFor="tab-2"
          className="tab"
          onClick={() => {
            setCheckedIndex(2);
          }}
        >
          {/* Sign Up */}
        </label>
        <div className="login-form mt-4">
          <div className="sign-in-htm">
            <div className="group">
              <label htmlFor="user" className="label mb-2">
                帐号/手机号
              </label>
              <input
                value={userInfo.name}
                id="user"
                type="text"
                className="input"
                onChange={(e) => setInfo({ name: e.target.value })}
              />
            </div>
            <div className="group ">
              <label htmlFor="pass" className="label mb-2">
                密码
                <span className="ml-2" onClick={() => {
                  setShowPasswd(!showPasswd)
                }}>
                  {
                    showPasswd ?
                      <VisibilityIcon /> :
                      <VisibilityOffIcon />
                  }
                </span>
              </label>
              <input
                value={userInfo.passwd}
                id="pass"
                type={showPasswd ? '' : "password"}
                className="input"
                onChange={(e) => setInfo({ passwd: e.target.value })}
              />
            </div>
            <div className="group py-4">
              <input id="check" type="checkbox" className="check" checked={userInfo.keep} onChange={(e) => {
                setInfo({ keep: e.target.checked })
              }} />
              <label htmlFor="check" >
                <span className="icon"></span> <span className="text-gray-400 select-none">记住密码</span>
              </label>
            </div>
            <div className="group">
              <Button
                className="w-full"
                size="large"
                variant="contained"
                onClick={onLogin}
                disabled={loading}
              >
                SIGN IN
              </Button>
              {/* <input type="submit" className="button" value="Sign In" /> */}
            </div>
            <div className="hr"></div>
            <div className="foot-lnk">
              <a href="/Setting?from=login">
                <div className="text-center text-gray-600 my-2">{eapUrl}</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
