import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InstanceDetail from './pages/InstanceDetail';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route
                    path="/instances/:id"
                    element={<InstanceDetail />}
                />
            </Routes>
        </BrowserRouter>
    );
}