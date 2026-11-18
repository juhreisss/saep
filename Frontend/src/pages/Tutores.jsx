
import { useEffect, useState } from 'react';
import api from '../services/api';
import './Tutores.css';

function Tutores() {
    const formularioInicial = {
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: ''
    };

    const [tutores, setTutores] = useState([]);
    const [pets, setPets] = useState([]);
    const [busca, setBusca] = useState('');

    const [modalAberto, setModalAberto] = useState(false);
    const [tutorEditando, setTutorEditando] = useState(null);
    const [detalhe, setDetalhe] = useState(null);

    const [formulario, setFormulario] = useState(formularioInicial);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        setCarregando(true);
        setErro('');

        try {
            const [resTutores, resPets] = await Promise.all([
                api.get('tutores/'),
                api.get('pets/')
            ]);

            setTutores(extrairLista(resTutores.data));
            setPets(extrairLista(resPets.data));
        } catch (error) {
            console.error(error);
            setErro('Não foi possível carregar os tutores.');
        } finally {
            setCarregando(false);
        }
    }

    function extrairLista(dados) {
        if (Array.isArray(dados)) return dados;
        return dados.results || [];
    }

    function alterarCampo(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: name === 'cpf'
                ? formatarCPF(value)
                : name === 'telefone'
                    ? formatarTelefone(value)
                    : value
        }));
    }

    function formatarCPF(valor) {
        const numeros = valor.replace(/\D/g, '').slice(0, 11);

        return numeros
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    function formatarTelefone(valor) {
        const numeros = valor.replace(/\D/g, '').slice(0, 11);

        if (numeros.length <= 10) {
            return numeros
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        }

        return numeros
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
    }

    function validarCPF(cpf) {
        const numeros = cpf.replace(/\D/g, '');

        if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
            return false;
        }

        let soma = 0;

        for (let i = 0; i < 9; i++) {
            soma += Number(numeros[i]) * (10 - i);
        }

        let digito = (soma * 10) % 11;
        if (digito === 10) digito = 0;

        if (digito !== Number(numeros[9])) return false;

        soma = 0;

        for (let i = 0; i < 10; i++) {
            soma += Number(numeros[i]) * (11 - i);
        }

        digito = (soma * 10) % 11;
        if (digito === 10) digito = 0;

        return digito === Number(numeros[10]);
    }

    function abrirCadastro() {
        setTutorEditando(null);
        setFormulario(formularioInicial);
        setErro('');
        setModalAberto(true);
    }

    function abrirEdicao(tutor) {
        setTutorEditando(tutor);

        setFormulario({
            nome: tutor.nome,
            cpf: formatarCPF(tutor.cpf || ''),
            telefone: formatarTelefone(tutor.telefone || ''),
            email: tutor.email,
            endereco: tutor.endereco
        });

        setErro('');
        setModalAberto(true);
    }

    async function salvarTutor(event) {
        event.preventDefault();

        setErro('');

        if (!validarCPF(formulario.cpf)) {
            setErro('Informe um CPF válido.');
            return;
        }

        setSalvando(true);

        const dados = {
            ...formulario,
            cpf: formulario.cpf.replace(/\D/g, '')
        };

        try {
            if (tutorEditando) {
                await api.put(`tutores/${tutorEditando.id}/`, dados);
            } else {
                await api.post('tutores/', dados);
            }

            setModalAberto(false);
            setFormulario(formularioInicial);
            setTutorEditando(null);

            await carregarDados();
        } catch (error) {
            console.error(error);

            const resposta = error.response?.data;

            const mensagem = typeof resposta === 'string'
                ? resposta
                : Object.entries(resposta || {})
                    .map(([campo, valor]) =>
                        `${campo}: ${Array.isArray(valor) ? valor.join(', ') : valor}`
                    )
                    .join(' | ');

            setErro(mensagem || 'Não foi possível salvar o tutor.');
        } finally {
            setSalvando(false);
        }
    }

    async function excluirTutor(id) {
        const possuiPets = pets.some(
            (pet) => Number(pet.tutor) === Number(id)
        );

        const mensagem = possuiPets
            ? 'Este tutor possui pets cadastrados. A exclusão também poderá excluir esses pets e seus agendamentos. Deseja continuar?'
            : 'Deseja realmente excluir este tutor?';

        if (!window.confirm(mensagem)) return;

        try {
            await api.delete(`tutores/${id}/`);
            setDetalhe(null);
            await carregarDados();
        } catch (error) {
            console.error(error);
            setErro('Não foi possível excluir o tutor.');
        }
    }

    const tutoresFiltrados = tutores.filter((tutor) => {
        const termo = busca.trim().toLowerCase();

        return [
            tutor.nome,
            tutor.cpf,
            tutor.telefone,
            tutor.email,
            tutor.endereco
        ].some((valor) =>
            String(valor || '').toLowerCase().includes(termo)
        );
    });

    function petsDoTutor(id) {
        return pets.filter(
            (pet) => Number(pet.tutor) === Number(id)
        );
    }

    function sair() {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/';
    }

    return (
        <div className="vet-layout">

            <aside className="vet-sidebar">
                <div className="vet-logo">
                    <div className="vet-logo-icon">V</div>
                    <div>
                        <h2>VetCare<span>.</span></h2>
                        <small>GESTÃO VETERINÁRIA</small>
                    </div>
                </div>

                <span className="menu-label">MENU PRINCIPAL</span>

                <nav className="vet-menu">
                    <a href="/agendamentos" className="menu-item">
                        <span>▦</span> Agendamentos
                    </a>

                    <a href="/pets" className="menu-item">
                        <span>♡</span> Pets
                    </a>

                    <a href="/tutores" className="menu-item ativo">
                        <span>♙</span> Tutores
                    </a>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-profile">
                        <div className="profile-avatar">V</div>
                        <div>
                            <strong>VetCare</strong>
                            <small>Administrador</small>
                        </div>
                    </div>

                    <button className="logout-button" onClick={sair}>
                        ↪ Sair da conta
                    </button>
                </div>
            </aside>

            <main className="vet-main">

                <header className="vet-header">
                    <div>
                        <span className="header-subtitle">GESTÃO DA CLÍNICA</span>
                        <h1>Tutores</h1>
                    </div>

                    <button className="new-appointment" onClick={abrirCadastro}>
                        + Novo tutor
                    </button>
                </header>

                <section className="welcome-section">
                    <div>
                        <h2>Quem cuida também merece atenção.</h2>
                        <p>
                            Gerencie os responsáveis pelos pacientes da clínica.
                        </p>
                    </div>

                    <div className="welcome-decoration">♡</div>
                </section>

                <section className="stats-grid tutor-stats">
                    <div className="stat-card">
                        <div className="stat-icon verde">♙</div>
                        <div>
                            <span>Total de tutores</span>
                            <strong>{tutores.length}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon azul">🐾</div>
                        <div>
                            <span>Pets cadastrados</span>
                            <strong>{pets.length}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon amarelo">♡</div>
                        <div>
                            <span>Tutores com pets</span>
                            <strong>
                                {tutores.filter(
                                    (tutor) => petsDoTutor(tutor.id).length > 0
                                ).length}
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="appointments-section">
                    <div className="section-heading">
                        <div>
                            <h2>Tutores cadastrados</h2>
                            <p>Consulte e gerencie os responsáveis pelos pacientes.</p>
                        </div>
                    </div>

                    <div className="table-filters">
                        <div className="search-box">
                            <span>⌕</span>
                            <input
                                type="text"
                                placeholder="Buscar por nome, CPF, telefone ou e-mail..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </div>

                    {erro && !modalAberto && (
                        <div className="page-error">{erro}</div>
                    )}

                    {carregando ? (
                        <div className="empty-state">Carregando tutores...</div>
                    ) : (
                        <div className="table-container">
                            <table className="appointments-table tutors-table">
                                <thead>
                                    <tr>
                                        <th>TUTOR</th>
                                        <th>CPF</th>
                                        <th>TELEFONE</th>
                                        <th>E-MAIL</th>
                                        <th>PETS</th>
                                        <th>AÇÕES</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tutoresFiltrados.length > 0 ? (
                                        tutoresFiltrados.map((tutor) => (
                                            <tr key={tutor.id}>
                                                <td>
                                                    <div className="pet-cell">
                                                        <div className="tutor-avatar">
                                                            {tutor.nome.charAt(0).toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <strong>{tutor.nome}</strong>
                                                            <small>{tutor.endereco}</small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>{tutor.cpf}</td>
                                                <td>{tutor.telefone}</td>
                                                <td>{tutor.email}</td>

                                                <td>
                                                    <span className="pet-count">
                                                        {petsDoTutor(tutor.id).length} pets
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            title="Visualizar"
                                                            onClick={() => setDetalhe(tutor)}
                                                        >
                                                            ◉
                                                        </button>

                                                        <button
                                                            title="Editar"
                                                            onClick={() => abrirEdicao(tutor)}
                                                        >
                                                            ✎
                                                        </button>

                                                        <button
                                                            title="Excluir"
                                                            className="delete-action"
                                                            onClick={() => excluirTutor(tutor.id)}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6">
                                                <div className="empty-state">
                                                    Nenhum tutor encontrado.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="table-footer">
                        Exibindo {tutoresFiltrados.length} de {tutores.length} tutores
                    </div>
                </section>
            </main>

            {modalAberto && (
                <div className="modal-overlay">
                    <div className="appointment-modal">
                        <div className="modal-header">
                            <div>
                                <span>GESTÃO DE RESPONSÁVEIS</span>
                                <h2>
                                    {tutorEditando ? 'Editar tutor' : 'Cadastrar novo tutor'}
                                </h2>
                            </div>

                            <button
                                className="close-modal"
                                onClick={() => setModalAberto(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={salvarTutor}>
                            <div className="modal-body">

                                <div className="form-field">
                                    <label>Nome completo *</label>
                                    <input
                                        type="text"
                                        name="nome"
                                        placeholder="Digite o nome completo"
                                        value={formulario.nome}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>CPF *</label>
                                        <input
                                            type="text"
                                            name="cpf"
                                            placeholder="000.000.000-00"
                                            value={formulario.cpf}
                                            onChange={alterarCampo}
                                            maxLength="14"
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Telefone *</label>
                                        <input
                                            type="text"
                                            name="telefone"
                                            placeholder="(00) 00000-0000"
                                            value={formulario.telefone}
                                            onChange={alterarCampo}
                                            maxLength="15"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>E-mail *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="exemplo@email.com"
                                        value={formulario.email}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Endereço *</label>
                                    <input
                                        type="text"
                                        name="endereco"
                                        placeholder="Rua, número, bairro e cidade"
                                        value={formulario.endereco}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>

                                {erro && (
                                    <div className="modal-error">{erro}</div>
                                )}

                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setModalAberto(false)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={salvando}
                                >
                                    {salvando ? 'Salvando...' : 'Salvar tutor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {detalhe && (
                <div className="modal-overlay">
                    <div className="appointment-modal detail-modal">
                        <div className="modal-header">
                            <div>
                                <span>INFORMAÇÕES DO RESPONSÁVEL</span>
                                <h2>{detalhe.nome}</h2>
                            </div>

                            <button
                                className="close-modal"
                                onClick={() => setDetalhe(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="detail-content">
                            <div className="tutor-detail-avatar">
                                {detalhe.nome.charAt(0).toUpperCase()}
                            </div>

                            <h3>Dados pessoais</h3>
                            <p><strong>Nome:</strong> {detalhe.nome}</p>
                            <p><strong>CPF:</strong> {detalhe.cpf}</p>
                            <p><strong>Telefone:</strong> {detalhe.telefone}</p>
                            <p><strong>E-mail:</strong> {detalhe.email}</p>
                            <p><strong>Endereço:</strong> {detalhe.endereco}</p>

                            <h3>Pets vinculados</h3>

                            {petsDoTutor(detalhe.id).length > 0 ? (
                                petsDoTutor(detalhe.id).map((pet) => (
                                    <div className="tutor-pet-item" key={pet.id}>
                                        <span>🐾</span>
                                        <div>
                                            <strong>{pet.nome}</strong>
                                            <small>{pet.especie} · {pet.raca}</small>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Este tutor ainda não possui pets cadastrados.</p>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="cancel-button"
                                onClick={() => setDetalhe(null)}
                            >
                                Fechar
                            </button>

                            <button
                                className="save-button"
                                onClick={() => {
                                    setDetalhe(null);
                                    abrirEdicao(detalhe);
                                }}
                            >
                                Editar tutor
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Tutores;
