
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Pets.css';

function Pets() {
    const formularioInicial = {
        nome: '',
        especie: '',
        raca: '',
        data_nascimento: '',
        tutor: ''
    };

    const [pets, setPets] = useState([]);
    const [tutores, setTutores] = useState([]);
    const [busca, setBusca] = useState('');
    const [filtroEspecie, setFiltroEspecie] = useState('Todas');

    const [modalAberto, setModalAberto] = useState(false);
    const [petEditando, setPetEditando] = useState(null);
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
            const [resPets, resTutores] = await Promise.all([
                api.get('pets/'),
                api.get('tutores/')
            ]);

            setPets(extrairLista(resPets.data));
            setTutores(extrairLista(resTutores.data));
        } catch (error) {
            console.error(error);
            setErro('Não foi possível carregar os pets.');
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
            [name]: value
        }));
    }

    function abrirCadastro() {
        setPetEditando(null);
        setFormulario(formularioInicial);
        setErro('');
        setModalAberto(true);
    }

    function abrirEdicao(pet) {
        setPetEditando(pet);

        setFormulario({
            nome: pet.nome,
            especie: pet.especie,
            raca: pet.raca,
            data_nascimento: pet.data_nascimento || '',
            tutor: String(pet.tutor)
        });

        setErro('');
        setModalAberto(true);
    }

    async function salvarPet(event) {
        event.preventDefault();
        setSalvando(true);
        setErro('');

        const dados = {
            ...formulario,
            tutor: Number(formulario.tutor),
            data_nascimento: formulario.data_nascimento || null
        };

        try {
            if (petEditando) {
                await api.put(`pets/${petEditando.id}/`, dados);
            } else {
                await api.post('pets/', dados);
            }

            setModalAberto(false);
            setFormulario(formularioInicial);
            setPetEditando(null);

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

            setErro(mensagem || 'Não foi possível salvar o pet.');
        } finally {
            setSalvando(false);
        }
    }

    async function excluirPet(id) {
        if (!window.confirm('Deseja realmente excluir este pet?')) return;

        try {
            await api.delete(`pets/${id}/`);
            setDetalhe(null);
            await carregarDados();
        } catch (error) {
            console.error(error);
            setErro('Não foi possível excluir o pet.');
        }
    }

    const especies = [...new Set(
        pets.map((pet) => pet.especie).filter(Boolean)
    )];

    const petsFiltrados = useMemo(() => {
        return pets.filter((pet) => {
            const termo = busca.toLowerCase();

            const correspondeBusca = [
                pet.nome,
                pet.especie,
                pet.raca,
                pet.tutor_nome
            ].some((valor) =>
                String(valor || '').toLowerCase().includes(termo)
            );

            const correspondeEspecie =
                filtroEspecie === 'Todas' ||
                pet.especie === filtroEspecie;

            return correspondeBusca && correspondeEspecie;
        });
    }, [pets, busca, filtroEspecie]);

    function formatarData(data) {
        if (!data) return 'Não informado';

        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function idadePet(data) {
        if (!data) return 'Idade não informada';

        const nascimento = new Date(`${data}T00:00:00`);
        const hoje = new Date();

        let anos = hoje.getFullYear() - nascimento.getFullYear();
        let meses = hoje.getMonth() - nascimento.getMonth();

        if (hoje.getDate() < nascimento.getDate()) meses--;

        if (meses < 0) {
            anos--;
            meses += 12;
        }

        if (anos < 0 || nascimento > hoje) return 'Data inválida';

        if (anos === 0 && meses === 0) return 'Menos de 1 mês';
        if (anos === 0) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;

        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }

    function iconeEspecie(especie) {
        const nome = (especie || '').toLowerCase();

        if (nome.includes('cachorro') || nome.includes('cão')) return '🐶';
        if (nome.includes('gato')) return '🐱';
        if (nome.includes('ave') || nome.includes('pássaro')) return '🐦';
        if (nome.includes('coelho')) return '🐰';
        return '🐾';
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

                    <a href="/pets" className="menu-item ativo">
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
                        <h1>Pets</h1>
                    </div>

                    <button className="new-appointment" onClick={abrirCadastro}>
                        + Novo pet
                    </button>
                </header>

                <section className="welcome-section">
                    <div>
                        <h2>Nossos pacientes merecem o melhor cuidado.</h2>
                        <p>
                            Gerencie os animais cadastrados e suas informações.
                        </p>
                    </div>
                    <div className="welcome-decoration">♡</div>
                </section>

                <section className="stats-grid pets-stats">
                    <div className="stat-card">
                        <div className="stat-icon verde">🐾</div>
                        <div>
                            <span>Total de pets</span>
                            <strong>{pets.length}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon azul">🐶</div>
                        <div>
                            <span>Cachorros</span>
                            <strong>
                                {pets.filter(p =>
                                    p.especie.toLowerCase().includes('cachorro') ||
                                    p.especie.toLowerCase().includes('cão')
                                ).length}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon amarelo">🐱</div>
                        <div>
                            <span>Gatos</span>
                            <strong>
                                {pets.filter(p =>
                                    p.especie.toLowerCase().includes('gato')
                                ).length}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon vermelho">♙</div>
                        <div>
                            <span>Tutores cadastrados</span>
                            <strong>{tutores.length}</strong>
                        </div>
                    </div>
                </section>

                <section className="appointments-section">
                    <div className="section-heading">
                        <div>
                            <h2>Pacientes cadastrados</h2>
                            <p>Consulte e gerencie os pets da clínica.</p>
                        </div>
                    </div>

                    <div className="table-filters">
                        <div className="search-box">
                            <span>⌕</span>
                            <input
                                type="text"
                                placeholder="Buscar por nome, espécie, raça ou tutor..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>

                        <select
                            value={filtroEspecie}
                            onChange={(e) => setFiltroEspecie(e.target.value)}
                        >
                            <option value="Todas">Todas as espécies</option>
                            {especies.map((especie) => (
                                <option key={especie} value={especie}>
                                    {especie}
                                </option>
                            ))}
                        </select>
                    </div>

                    {erro && !modalAberto && (
                        <div className="page-error">{erro}</div>
                    )}

                    {carregando ? (
                        <div className="empty-state">Carregando pacientes...</div>
                    ) : (
                        <div className="table-container">
                            <table className="appointments-table pets-table">
                                <thead>
                                    <tr>
                                        <th>PET</th>
                                        <th>ESPÉCIE</th>
                                        <th>RAÇA</th>
                                        <th>NASCIMENTO</th>
                                        <th>TUTOR</th>
                                        <th>AÇÕES</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {petsFiltrados.length > 0 ? (
                                        petsFiltrados.map((pet) => (
                                            <tr key={pet.id}>
                                                <td>
                                                    <div className="pet-cell">
                                                        <div className="pet-avatar">
                                                            {iconeEspecie(pet.especie)}
                                                        </div>
                                                        <div>
                                                            <strong>{pet.nome}</strong>
                                                            <small>{idadePet(pet.data_nascimento)}</small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>{pet.especie}</td>
                                                <td>{pet.raca}</td>
                                                <td>{formatarData(pet.data_nascimento)}</td>
                                                <td>{pet.tutor_nome}</td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            title="Visualizar"
                                                            onClick={() => setDetalhe(pet)}
                                                        >
                                                            ◉
                                                        </button>

                                                        <button
                                                            title="Editar"
                                                            onClick={() => abrirEdicao(pet)}
                                                        >
                                                            ✎
                                                        </button>

                                                        <button
                                                            title="Excluir"
                                                            className="delete-action"
                                                            onClick={() => excluirPet(pet.id)}
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
                                                    Nenhum pet encontrado.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="table-footer">
                        Exibindo {petsFiltrados.length} de {pets.length} pets
                    </div>
                </section>
            </main>

            {modalAberto && (
                <div className="modal-overlay">
                    <div className="appointment-modal">
                        <div className="modal-header">
                            <div>
                                <span>GESTÃO DE PACIENTES</span>
                                <h2>{petEditando ? 'Editar pet' : 'Cadastrar novo pet'}</h2>
                            </div>

                            <button
                                className="close-modal"
                                onClick={() => setModalAberto(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={salvarPet}>
                            <div className="modal-body">

                                <div className="form-field">
                                    <label>Nome do pet *</label>
                                    <input
                                        type="text"
                                        name="nome"
                                        placeholder="Ex.: Bob"
                                        value={formulario.nome}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Espécie *</label>
                                        <select
                                            name="especie"
                                            value={formulario.especie}
                                            onChange={alterarCampo}
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            <option value="Cachorro">Cachorro</option>
                                            <option value="Gato">Gato</option>
                                            <option value="Ave">Ave</option>
                                            <option value="Coelho">Coelho</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Raça *</label>
                                        <input
                                            type="text"
                                            name="raca"
                                            placeholder="Ex.: Golden Retriever"
                                            value={formulario.raca}
                                            onChange={alterarCampo}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Data de nascimento</label>
                                    <input
                                        type="date"
                                        name="data_nascimento"
                                        value={formulario.data_nascimento}
                                        onChange={alterarCampo}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

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

                                {tutores.length === 0 && (
                                    <div className="modal-error">
                                        Cadastre um tutor antes de cadastrar um pet.
                                    </div>
                                )}

                                {erro && <div className="modal-error">{erro}</div>}
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
                                    disabled={salvando || tutores.length === 0}
                                >
                                    {salvando ? 'Salvando...' : 'Salvar pet'}
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
                                <span>INFORMAÇÕES DO PACIENTE</span>
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
                            <div className="pet-detail-icon">
                                {iconeEspecie(detalhe.especie)}
                            </div>

                            <h3>Dados do pet</h3>
                            <p><strong>Nome:</strong> {detalhe.nome}</p>
                            <p><strong>Espécie:</strong> {detalhe.especie}</p>
                            <p><strong>Raça:</strong> {detalhe.raca}</p>
                            <p><strong>Nascimento:</strong> {formatarData(detalhe.data_nascimento)}</p>
                            <p><strong>Idade:</strong> {idadePet(detalhe.data_nascimento)}</p>

                            <h3>Tutor responsável</h3>
                            <p><strong>Nome:</strong> {detalhe.tutor_nome}</p>
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
                                Editar pet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pets;
