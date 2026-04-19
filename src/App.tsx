import { RouterProvider } from 'react-router';
import MainRouter from './routers';

function App() {
  return <RouterProvider router={MainRouter} />;
}

export default App;
