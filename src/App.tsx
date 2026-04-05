import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Home from './pages/Home';
import RecordList from './pages/RecordList';
import './App.css';

// 画面遷移アニメーション（スライドイン右から左）を TransitionGroup で管理する。
// react-transition-group を使うことで、ページ単位の CSS アニメーションを
// React のライフサイクルと連動させられる。
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <TransitionGroup component={null}>
      {/* key に location.pathname を渡すことで、パス変更のたびに
          enter/exit アニメーションが発火する */}
      <CSSTransition key={location.pathname} classNames="slide" timeout={300} unmountOnExit>
        <div className="page">
          <Routes location={location}>
            {/* pathが/のときはHome, pathが/recordsのときはRecordListを画面に表示する（≒ページ遷移させる） */}
            <Route path="/" element={<Home />} />
            <Route path="/records" element={<RecordList />} />
            {/* 定義外のパスはすべてホームへリダイレクト */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default App;
