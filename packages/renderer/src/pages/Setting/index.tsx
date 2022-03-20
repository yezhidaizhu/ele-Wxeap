import { useState, useEffect } from "react";
import { Alert, Box, Button, Snackbar, Tab, Tabs } from "@mui/material";
import store from "@/samples/electron-store";
import SetEapUrl from "./SetEapUrl";
import SetQuickMenu from "./SetQuickMenu";
import queryString from "query-string";
import { useLocation } from "react-router";

export default function Setting() {
  const locotion = useLocation();
  const [isFromLogin, setIsFromLogin] = useState(false);

  const [tab, setTab] = useState(0);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState("info");
  const [alertStr, setAlertStr] = useState("");

  // const [eapUrl, setEapUrl] = useState("");

  const handleTabChange = (event: any, newValue: any) => setTab(newValue);

  const handleAlertClose = (event: any, reason: any) => {
    if (reason === 'clickaway') { return }
    setOpenAlert(false);
  };

  const setAlert = (str = "", status = "") => {
    setAlertStatus(status);
    setAlertStr(str);
    setOpenAlert(true);
  }

  const alertErr = (str = "") => setAlert(str, "error");
  const alertSuccess = (str = "") => setAlert(str, "success");

  useEffect(() => {
    window.ipcRenderer?.on("setting-reply", (event, arg) => {
      if (arg === 1) {
        alertSuccess("设置成功")
      } else {
        alertErr("设置失败")
      }
    });
    return () => {
      window.ipcRenderer.removeAllListeners("setting-reply");
    }
  }, [])

  useEffect(() => {
    const params = queryString.parse(locotion.search);

    if (params?.from) {
      setIsFromLogin(true);
    }
  }, []);

  return (
    <div className="login-wrap-bg text-gray-300">
      <div className="login-bg p-2 h-full w-full">
        <div className="text-right">
          {
            isFromLogin &&
            <Button size="small">
              <a href="/login">Sigin In</a>
            </Button>
          }
        </div>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="eap" />
            <Tab label="菜单快捷设置" />
            <Tab label="Item Three" />
          </Tabs>
        </Box>

        {
          tab === 0 &&
          <SetEapUrl alertErr={alertErr} />
        }
        {
          tab === 1 &&
          <SetQuickMenu alertErr={alertErr} />
        }

        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleAlertClose}>
          <Alert onClose={handleAlertClose} severity={alertStatus} >
            {alertStr}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}