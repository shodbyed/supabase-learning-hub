import { Routes, Route } from 'react-router-dom';
import { Home } from '../home/Home';
import { About } from '../about/About';

export const NavRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};
