import { Routes, Route } from 'react-router-dom';

export const NavRoutes: React.FC = () => {
  const Home: React.FC = () => <h2>Home Page new</h2>;
  const About: React.FC = () => <h2>About Page new</h2>;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};
