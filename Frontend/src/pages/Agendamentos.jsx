
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Agendamentos.css';

function Agendamentos() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [tutores, setTutores] = useState([]);
    const [pets, setPets] = useState([]);

    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos');

    const [modalAberto, setModalAberto] = useState(false);
    const [agendamentoEditando, setAgendamentoEditando] = useState(null);
    const [detalhe, setDetalhe] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    const formularioInicial = {
        tutor: '',
        pet: '',
        data_agendamento: '',
        horario: '',
        descricao: '',
        status: 'Agendado'
    };

    const [formulario, setFormulario] = useState(formularioInicial);

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        setCarregando(true);
        setErro('');

        try {
            const [resAgendamentos, resTutores, resPets] =
                await Promise.all([
                    api.get('agendamentos/'),
                    api.get('tutores/'),
                    api.get('pets/')
                ]);

            setAgendamentos(extrairLista(resAgendamentos.data));
            setTutores(extrairLista(resTutores.data));
            setPets(extrairLista(resPets.data));
        } catch (error) {
            console.error(error);
            setErro('Não foi possível carregar os dados. Verifique sua conexão.');
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
            [name]: value,
            ...(name === 'tutor' ? { pet: '' } : {})
        }));
    }

    function abrirCadastro() {
        setAgendamentoEditando(null);
        setFormulario(formularioInicial);
        setErro('');
        setModalAberto(true);
    }

    function abrirEdicao(agendamento) {
        setAgendamentoEditando(agendamento);

        setFormulario({
            tutor: String(agendamento.tutor),
            pet: String(agendamento.pet),
            data_agendamento: agendamento.data_agendamento,
            horario: agendamento.horario.slice(0, 5),
            descricao: agendamento.descricao,
            status: agendamento.status
        });

        setErro('');
        setModalAberto(true);
    }

    async function salvarAgendamento(event) {
        event.preventDefault();
        setSalvando(true);
        setErro('');

        const dados = {
            ...formulario,
            tutor: Number(formulario.tutor),
            pet: Number(formulario.pet)
        };

        try {
            if (agendamentoEditando) {
                await api.put(
                    `agendamentos/${agendamentoEditando.id}/`,
                    dados
                );
            } else {
                await api.post('agendamentos/', dados);
            }

            setModalAberto(false);
            setFormulario(formularioInicial);
            setAgendamentoEditando(null);
            await carregarDados();
        } catch (error) {
            console.error(error);

            const resposta = error.response?.data;
            const mensagem =
                typeof resposta === 'string'
                    ? resposta
                    : Object.entries(resposta || {})
                        .map(([campo, valor]) =>
                            `${campo}: ${Array.isArray(valor) ? valor.join(', ') : valor}`
                        )
                        .join(' | ');

            setErro(mensagem || 'Não foi possível salvar o agendamento.');
        } finally {
            setSalvando(false);
        }
    }

    async function excluirAgendamento(id) {
        if (!window.confirm('Deseja realmente excluir este agendamento?')) {
            return;
        }

        try {
            await api.delete(`agendamentos/${id}/`);
            setDetalhe(null);
            await carregarDados();
        } catch (error) {
            console.error(error);
            setErro('Não foi possível excluir o agendamento.');
        }
    }

    const petsDoTutor = useMemo(() => {
        return pets.filter(
            (pet) => String(pet.tutor) === String(formulario.tutor)
        );
    }, [pets, formulario.tutor]);

    const agendamentosFiltrados = useMemo(() => {
        return agendamentos.filter((item) => {
            const termo = busca.toLowerCase();

            const correspondeBusca = [
                item.pet_nome,
                item.tutor_nome,
                item.descricao
            ].some((valor) =>
                String(valor || '').toLowerCase().includes(termo)
            );

            const correspondeStatus =
                filtroStatus === 'Todos' || item.status === filtroStatus;

            return correspondeBusca && correspondeStatus;
        });
    }, [agendamentos, busca, filtroStatus]);

    const totalAgendados = agendamentos.filter(
        (item) => item.status === 'Agendado'
    ).length;

    const totalConcluidos = agendamentos.filter(
        (item) => item.status === 'Concluído'
    ).length;

    const totalCancelados = agendamentos.filter(
        (item) => item.status === 'Cancelado'
    ).length;

    function formatarData(data) {
        if (!data) return '-';

        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function statusClasse(status) {
        if (status === 'Agendado') return 'agendado';
        if (status === 'Concluído') return 'concluido';
        return 'cancelado';
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
                    <a href="/agendamentos" className="menu-item ativo">
                        <span>▦</span> Agendamentos
                    </a>

                    <a href="/pets" className="menu-item">
                        <span>♡</span> Pets
                    </a>

                    <a href="/tutores" className="menu-item">
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
                        <h1>Agendamentos</h1>
                    </div>

                    <button className="new-appointment" onClick={abrirCadastro}>
                        + Novo agendamento
                    </button>
                </header>

                <section className="welcome-section">
                    <div>
                        <h2>Seus atendimentos, organizados.</h2>
                        <p>
                            Acompanhe e gerencie os agendamentos da sua clínica.
                        </p>
                    </div>
                    <div className="welcome-decoration">✳</div>
                </section>

                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon verde">▦</div>
                        <div>
                            <span>Total de agendamentos</span>
                            <strong>{agendamentos.length}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon azul">◷</div>
                        <div>
                            <span>Agendados</span>
                            <strong>{totalAgendados}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon amarelo">✓</div>
                        <div>
                            <span>Concluídos</span>
                            <strong>{totalConcluidos}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon vermelho">×</div>
                        <div>
                            <span>Cancelados</span>
                            <strong>{totalCancelados}</strong>
                        </div>
                    </div>
                </section>

                <section className="appointments-section">
                    <div className="section-heading">
                        <div>
                            <h2>Lista de agendamentos</h2>
                            <p>Consulte e gerencie os atendimentos cadastrados.</p>
                        </div>
                    </div>

                    <div className="table-filters">
                        <div className="search-box">
                            <span>⌕</span>
                            <input
                                type="text"
                                placeholder="Buscar por pet, tutor ou descrição..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>

                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                        >
                            <option value="Todos">Todos os status</option>
                            <option value="Agendado">Agendados</option>
                            <option value="Concluído">Concluídos</option>
                            <option value="Cancelado">Cancelados</option>
                        </select>
                    </div>

                    {erro && !modalAberto && (
                        <div className="page-error">{erro}</div>
                    )}

                    {carregando ? (
                        <div className="empty-state">
                            Carregando agendamentos...
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="appointments-table">
                                <thead>
                                    <tr>
                                        <th>PET</th>
                                        <th>TUTOR</th>
                                        <th>DATA</th>
                                        <th>HORÁRIO</th>
                                        <th>STATUS</th>
                                        <th>AÇÕES</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {agendamentosFiltrados.length > 0 ? (
                                        agendamentosFiltrados.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="pet-cell">
                                                        <div className="pet-avatar">♡</div>
                                                        <div>
                                                            <strong>{item.pet_nome}</strong>
                                                            <small>
                                                                {item.pet_especie} · {item.pet_raca}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>{item.tutor_nome}</td>
                                                <td>{formatarData(item.data_agendamento)}</td>
                                                <td>{item.horario.slice(0, 5)}</td>

                                                <td>
                                                    <span className={`status-badge ${statusClasse(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            title="Visualizar"
                                                            onClick={() => setDetalhe(item)}
                                                        >
                                                            ◉
                                                        </button>

                                                        <button
                                                            title="Editar"
                                                            onClick={() => abrirEdicao(item)}
                                                        >
                                                            ✎
                                                        </button>

                                                        <button
                                                            title="Excluir"
                                                            className="delete-action"
                                                            onClick={() => excluirAgendamento(item.id)}
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
                                                    Nenhum agendamento encontrado.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="table-footer">
                        Exibindo {agendamentosFiltrados.length} de {agendamentos.length} agendamentos
                    </div>
                </section>

            </main>

            {modalAberto && (
                <div className="modal-overlay">
                    <div className="appointment-modal">
                        <div className="modal-header">
                            <div>
                                <span>GESTÃO DE ATENDIMENTOS</span>
                                <h2>
                                    {agendamentoEditando
                                        ? 'Editar agendamento'
                                        : 'Novo agendamento'}
                                </h2>
                            </div>

                            <button
                                className="close-modal"
                                onClick={() => setModalAberto(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={salvarAgendamento}>
                            <div className="modal-body">

                                <div className="form-field">
                                    <label>Tutor responsável *</label>
                                    <select
                                        name="tutor"
                                        value={formulario.tutor}
                                        onChange={alterarCampo}
                                        required
                                    >
                                        <option value="">Selecione um tutor</option>
                                        {tutores.map((tutor) => (
                                            <option key={tutor.id} value={tutor.id}>
                                                {tutor.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>Pet *</label>
                                    <select
                                        name="pet"
                                        value={formulario.pet}
                                        onChange={alterarCampo}
                                        required
                                        disabled={!formulario.tutor}
                                    >
                                        <option value="">Selecione um pet</option>
                                        {petsDoTutor.map((pet) => (
                                            <option key={pet.id} value={pet.id}>
                                                {pet.nome} - {pet.especie}
                                            </option>
                                        ))}
                                    </select>
                                    {formulario.tutor && petsDoTutor.length === 0 && (
                                        <small>Este tutor ainda não possui pets cadastrados.</small>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Data *</label>
                                        <input
                                            type="date"
                                            name="data_agendamento"
                                            value={formulario.data_agendamento}
                                            onChange={alterarCampo}
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Horário *</label>
                                        <input
                                            type="time"
                                            name="horario"
                                            value={formulario.horario}
                                            onChange={alterarCampo}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Descrição do atendimento *</label>
                                    <textarea
                                        name="descricao"
                                        placeholder="Descreva o motivo da consulta..."
                                        value={formulario.descricao}
                                        onChange={alterarCampo}
                                        required
                                        rows="4"
                                    />
                                </div>

                                {agendamentoEditando && (
                                    <div className="form-field">
                                        <label>Status</label>
                                        <select
                                            name="status"
                                            value={formulario.status}
                                            onChange={alterarCampo}
                                        >
                                            <option value="Agendado">Agendado</option>
                                            <option value="Concluído">Concluído</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                    </div>
                                )}

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
                                    {salvando ? 'Salvando...' : 'Salvar agendamento'}
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
                                <span>DETALHES DO ATENDIMENTO</span>
                                <h2>{detalhe.pet_nome}</h2>
                            </div>

                            <button
                                className="close-modal"
                                onClick={() => setDetalhe(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="detail-content">
                            <span className={`status-badge ${statusClasse(detalhe.status)}`}>
                                {detalhe.status}
                            </span>

                            <h3>Informações do pet</h3>
                            <p><strong>Nome:</strong> {detalhe.pet_nome}</p>
                            <p><strong>Espécie:</strong> {detalhe.pet_especie}</p>
                            <p><strong>Raça:</strong> {detalhe.pet_raca}</p>

                            <h3>Informações do tutor</h3>
                            <p><strong>Nome:</strong> {detalhe.tutor_nome}</p>
                            <p><strong>Telefone:</strong> {detalhe.tutor_telefone}</p>
                            <p><strong>E-mail:</strong> {detalhe.tutor_email}</p>
                            <p><strong>Endereço:</strong> {detalhe.tutor_endereco}</p>

                            <h3>Atendimento</h3>
                            <p><strong>Data:</strong> {formatarData(detalhe.data_agendamento)}</p>
                            <p><strong>Horário:</strong> {detalhe.horario.slice(0, 5)}</p>
                            <p><strong>Descrição:</strong> {detalhe.descricao}</p>
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
                                Editar agendamento
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Agendamentos;
