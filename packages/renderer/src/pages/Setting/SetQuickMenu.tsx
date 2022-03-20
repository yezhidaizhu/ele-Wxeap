import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemText, TextField } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import store from "@/samples/electron-store";
import { useState, useEffect } from "react";

export default function SetQuickMenu(props: { alertErr?: Function, }) {
  const { alertErr = () => { } } = props;

  const [quickMenu, setQuickMenu] = useState<Array<{ name: string, path: string }>>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [curKey, setCurKey] = useState(-1);

  const [mValue, setMValue] = useState({
    name: "",
    path: "",
  });

  const initEapConfig = async () => {
    const eapConfig = await store.get("eapConfig");
    // console.log(userInfo);
    const { quickMenu = [] } = eapConfig || {};
    setQuickMenu(quickMenu);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setMValue({ name: "", path: "" });
  };

  const handleAlertClose = () => {
    setOpenAlert(false);
    setTimeout(() => {
      setCurKey(-1);
    }, 100)
  };

  const onDialogComfirm = () => {
    addMenu({
      ...mValue, cb() {
        handleDialogClose();
      }
    });
  }

  const onAlertComfirm = () => {
    onDelete(curKey);
    handleAlertClose();
  }


  const addMenu = (config: { name: string, path: string, cb?: Function }) => {
    const { name = "", path = "", cb } = config || {};
    const newMenuChild = { name, path };
    if (!name.trim() || !path.trim()) {
      return alertErr("填写均不能为空");
    }
    const _quickMenu = [...quickMenu];
    if (curKey >= 0 && quickMenu[curKey]) {
      _quickMenu[curKey] = newMenuChild;
    } else {
      _quickMenu.push(newMenuChild);
    }
    window?.ipcRenderer?.send?.("setting-msg", { quickMenu: _quickMenu });
    cb?.();
  }

  const onDelete = (index: number) => {
    if (!quickMenu[index]) return;
    const _quickMenu = [...quickMenu];
    _quickMenu.splice(index, 1);
    window?.ipcRenderer?.send?.("setting-msg", { quickMenu: _quickMenu });
  }

  useEffect(() => {
    window.ipcRenderer?.on("setting-reply", (event, arg) => {
      if (arg === 1) {
        initEapConfig();
      }
    });
    return () => {
      window.ipcRenderer.removeAllListeners("setting-reply");
    }
  }, [])

  useEffect(() => {
    initEapConfig()
  }, []);

  return (<div className="pr-0 h-full pb-36">
    <div className={`p-2 h-full overflow-hidden overflow-y-auto `}>
      <List>
        {
          quickMenu?.map(({ name, path }, index) =>
            <ListItem
              key={index}
              disablePadding
              secondaryAction={
                <>
                  <span className="mr-4">
                    <IconButton edge="end" onClick={() => {
                      setCurKey(index);
                      setMValue({ name, path })
                      setOpenDialog(true);
                    }}>
                      <EditIcon />
                    </IconButton>
                  </span>
                  <IconButton edge="end" onClick={() => {
                    setCurKey(index);
                    setOpenAlert(true);
                  }}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }>
              <ListItemButton >
                <ListItemText primary={name} secondary={path} />
              </ListItemButton>
            </ListItem>
          )
        }

      </List>
    </div>

    <div className="p-4 text-right">
      <Button variant="outlined" onClick={() => setOpenDialog(true)}>新增</Button>
    </div>

    <Dialog fullWidth maxWidth="lg" open={openDialog} onClose={handleDialogClose} className="w-full">
      <DialogTitle>新增</DialogTitle>
      <DialogContent>
        <TextField
          value={mValue.name}
          onChange={(e) => setMValue({ ...mValue, name: e.target.value })}
          required
          label="名称"
          fullWidth
          variant="standard"
        />
        <TextField
          value={mValue.path}
          onChange={(e) => setMValue({ ...mValue, path: e.target.value })}
          autoFocus
          required
          label="相对路径"
          margin="dense"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>取消</Button>
        <Button onClick={onDialogComfirm}>确定</Button>
      </DialogActions>
    </Dialog>

    <Dialog
      open={openAlert}
      onClose={handleAlertClose}
      fullWidth maxWidth="lg"
    >
      <DialogTitle>
        删除
        </DialogTitle>
      <DialogContent>
        <DialogContentText >
          确定删除 `{quickMenu[curKey]?.name}` 吗？
          </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAlertClose}>取消</Button>
        <Button onClick={onAlertComfirm} autoFocus>
          确定
          </Button>
      </DialogActions>
    </Dialog>
  </div>);
}

