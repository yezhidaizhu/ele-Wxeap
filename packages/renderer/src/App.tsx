import styles from '@/styles/app.module.scss'
import { useEffect } from 'react'
import queryString from 'query-string';
import { Route, Routes, useLocation, useNavigate } from 'react-router'

import Bar from '@/pages/LeftBar'
import Loading from '@/pages/Loading';

const App = () => {
  const locotion = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    const params = queryString.parse(locotion.search);

    if (params.to) {
      navigate(`/${params.to}`);
    }

  }, [])


  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<Loading />} />
        <Route path="/bar" element={<Bar />} />
      </Routes>
    </div>
  )
}

export default App
