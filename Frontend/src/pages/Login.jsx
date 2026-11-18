
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    async function entrar(event) {
        event.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const resposta = await api.post('login/', {
                username,
                password
            });

            localStorage.setItem('access', resposta.data.access);
            localStorage.setItem('refresh', resposta.data.refresh);

            navigate('/agendamentos');
        } catch {
            setErro('Usuário ou senha incorretos.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-brand">
                <div className="brand-content">
                    <div className="brand-logo">
                        <span>V</span>
                    </div>

                    <h1>VetCare<span>.</span></h1>
                    <p className="brand-subtitle">GESTÃO VETERINÁRIA</p>

                    <div className="brand-message">
                        <h2>Cuidar bem começa<br />com uma boa gestão.</h2>
                        <p>
                            Organize seus atendimentos, acompanhe
                            seus pacientes e mantenha tudo em um só lugar.
                        </p>
                    </div>

                    <div className="brand-decoration">
                        <span>✳</span>
                        <span>♡</span>
                        <span>✳</span>
                    </div>

                    <p className="brand-footer">
                        Cuidado, organização e confiança.
                    </p>
                </div>
            </section>

            <section className="login-area">
                <div className="login-form-container">
                    <div className="form-heading">
                        <span className="welcome-label">BEM-VINDO DE VOLTA</span>
                        <h2>Acesse sua conta</h2>
                        <p>Informe seus dados para continuar.</p>
                    </div>

                    <form onSubmit={entrar}>
                        <div className="form-group">
                            <label htmlFor="username">Usuário</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Digite seu usuário"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Senha</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {erro && (
                            <div className="login-error">{erro}</div>
                        )}

                        <button type="submit" disabled={carregando}>
                            {carregando ? 'Entrando...' : 'Entrar na plataforma'}
                            <span>→</span>
                        </button>
                    </form>

                    <div className="form-bottom">
                        <span>VetCare</span>
                        <span>© 2026 · Todos os direitos reservados</span>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Login;
