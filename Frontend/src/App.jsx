
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Agendamentos from './pages/Agendamentos';
import Pets from './pages/Pets';
import Tutores from './pages/Tutores';

function Protegida({ children }) {
    return localStorage.getItem('access')
        ? children
        : <Navigate to="/" />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route path="/agendamentos" element={
                    <Protegida><Agendamentos /></Protegida>
                } />

                <Route path="/pets" element={
                    <Protegida><Pets /></Protegida>
                } />

                <Route path="/tutores" element={
                    <Protegida><Tutores /></Protegida>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
