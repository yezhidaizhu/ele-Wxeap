import styles from "@/styles/app.module.scss";
import { useEffect } from "react";
import queryString from "query-string";
import { Route, Routes, useLocation, useNavigate } from "react-router";

import Loading from "@/pages/Loading";
import Login from "./pages/Login";
import Setting from "@/pages/Setting";
import { createTheme, ThemeProvider } from "@mui/material";

const App = () => {
  const locotion = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = queryString.parse(locotion.search);

    if (params.to) {
      navigate(`/${params.to}`);
    }
  }, []);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <div className={styles.app}>
      <ThemeProvider theme={darkTheme}>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
};

export default App;
