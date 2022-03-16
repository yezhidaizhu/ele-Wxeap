import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import LinearProgress from "@mui/material/LinearProgress";
import { Button } from "@mui/material";

export default function Login() {
  const [checkedIndex, setCheckedIndex] = useState(1);
  const [openForgot, setOpenForgot] = useState(false);
  const [loading, setLoading] = useState(false); // 登录信息
  const [name, setName] = useState(""); // 登录信息
  const [passwd, setPasswd] = useState(""); // 登录信息

  const handleClose = () => setOpenForgot(false);

  const onLogin = () => {
    window.ipcRenderer?.send("login-msg", name, passwd);
    setLoading(true);
  };

  window.ipcRenderer?.on("login-reply", (event, arg) => {
    console.log(arg);
  });

  return (
    <div className="login-wrap">
      <div
        className={`absolute top-0 left-0 w-full z-10 ${
          !loading && "opacity-0"
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
                value={name}
                id="user"
                type="text"
                className="input"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="group ">
              <label htmlFor="pass" className="label mb-2">
                密码
              </label>
              <input
                value={passwd}
                id="pass"
                type="password"
                className="input"
                data-type="password"
                onChange={(e) => setPasswd(e.target.value)}
              />
            </div>
            <div className="group">
              <input id="check" type="checkbox" className="check" checked />
              <label htmlFor="check" className=" opacity-0 ">
                <span className="icon"></span> Keep me Signed in
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
              <a href="#forgot" onClick={() => setOpenForgot(true)}>
                Forgot Password?
              </a>
              <Snackbar
                open={openForgot}
                autoHideDuration={3000}
                message="Note archived"
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              />
            </div>
          </div>
          <div className="sign-up-htm">
            <div className="group">
              <label htmlFor="user" className="label">
                Username
              </label>
              <input id="user" type="text" className="input" />
            </div>
            <div className="group">
              <label htmlFor="pass" className="label">
                Password
              </label>
              <input
                id="pass"
                type="password"
                className="input"
                data-type="password"
              />
            </div>
            <div className="group">
              <label htmlFor="pass" className="label">
                Repeat Password
              </label>
              <input
                id="pass"
                type="password"
                className="input"
                data-type="password"
              />
            </div>
            <div className="group">
              <label htmlFor="pass" className="label">
                Email Address
              </label>
              <input id="pass" type="text" className="input" />
            </div>
            <div className="group">
              <input type="submit" className="button" value="Sign Up" />
            </div>
            <div className="hr"></div>
            <div className="foot-lnk">
              <label htmlFor="tab-1">Already Member?</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
