import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import {
    ContainerStyled,
    FilterOptions,
    HeaderPet,
    Overflow, SummaryStyled, TitleStyled, WrapperMark
} from './styles';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { useDispatch } from 'react-redux';
import {
    MedicalInformation,
    MedicalServicesOutlined,
    PetsOutlined,
    VaccinesOutlined
} from '@mui/icons-material';
import { styled } from '@mui/material';
import { StepIconProps } from '@mui/material/StepIcon';
import { showModal } from '../../redux/modalSlice';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import useWindowDimensions from '../../core/hooks/useWindowDimensions';
import api from '../../services/api';
import Loading from '../../components/layout/components/loading';
import { show } from '../../redux/toastSlice';
import { Section } from '../../components/layout/components/section/sections';
import HeaderPage from '../../components/layout/components/headerPage/headerPage';
import { ERoutes } from '../../core/enums/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Container } from 'react-bootstrap';
import { isSameDay, isSameMonth, isSameWeek, subMonths } from 'date-fns';

type MyStepIconPropsT = {
    extraParams: Record<string, any>;
} & StepIconProps;


type QueryParamsT = {
    petId: string;
};

type UserFoundT = {
    name: string;
};

type PetT = {
    size: string;
    gender: string;
    age: string;
    id: number;
    breed: string;
    specie: string;
    name: string;
    description: string;
    weight: number;
    castrated: boolean;
}

type StepT = {
    title: string;
    type: string;
    description: string;
    clinic: string;
    vet: string;
    created_date: Date | any;
    created_by_id: number,
    created_by_role: string
}

type OptionsConvertDateT = {
    dateStyle?: string;
    timeStyle?: string;
}

const ColorlibStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
    backgroundColor: '#7fc9cd',
    '&:hover': {
        backgroundColor: '#66a8ac !important',
        scale: '1.1'
    },
    zIndex: 1,
    color: '#fff',
    width: 40,
    height: 40,
    padding: '1.2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: '50%',
    cursor: "pointer",
    transition: 'all .3s ease',

    ...(ownerState.active && {
        /*backgroundImage:
            'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',*/
        background: "#fe51b3",
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',

        '&:hover': {
            backgroundColor: '#dd439a !important',
            scale: '1.1'
        }
    })/*,
    ...(ownerState.active && {
        backgroundImage:
            'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
    }),*/
}));

function ColorlibStepIcon(props: MyStepIconPropsT) {
    const { active, completed, className, extraParams } = props;

    const icons: { [index: string]: React.ReactElement } = {
        CONSULTA: <PetsOutlined />,
        MEDICAMENTO: <VaccinesOutlined />,
        OUTRO: <MedicalServicesOutlined />,
        PROCEDIMENTO: <MedicalInformation />,
    };

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {icons[String(extraParams.step?.type.toUpperCase())]}
        </ColorlibStepIconRoot>
    );
}

export default function HistoryPage() {
    const dispatch = useDispatch();
    const location = useLocation();
    const params = useParams<QueryParamsT>();
    const urlParams = new URLSearchParams(location.search);
    const [positionTop, setPositionTop] = useState();
    const [positionLeft, setPositionLeft] = useState();
    const ref = useRef<HTMLDivElement | null>(null);
    const { width } = useWindowDimensions();
    const [steps, setSteps] = useState<Array<StepT>>([]);
    const [filteredSteps, setFilteredSteps] = useState<Array<StepT>>([]);
    const [modalMoreDetails, setModalMoreDetails] = useState<StepT>({
        title: "",
        description: "",
        vet: "",
        clinic: "",
        created_date: "",
        type: "",
        created_by_id: 0,
        created_by_role: ""
    } as StepT);
    const [isLoading, setIsLoading] = useState(false);
    const [userFound, setUserFound] = useState<UserFoundT>();
    const [pet, setPet] = useState({} as PetT);
    const navigate = useNavigate();
    const [filter, setFilter] = useState("DEFAULT");

    const moreDetailsElement = <div>
        <div className='d-flex justify-content-between mb-4'>
            <Typography variant='body2' style={{ color: '#0b344e' }}>{modalMoreDetails.title}</Typography>
            <Typography variant='body2' style={{ color: '#0b344e' }}>{convertDate(modalMoreDetails.created_date, { dateStyle: "long" })}</Typography>
        </div>
        <Typography variant='body2' style={{ color: '#0b344e' }}>Atendimento feito por: {modalMoreDetails.vet}</Typography>
        <Typography variant='body2' style={{ color: '#0b344e' }}>Clínica: {modalMoreDetails.clinic}</Typography>

        <div className='mt-4 d-flex flex-column'>
            <Typography variant="body2">Descrição</Typography>
            <p>{modalMoreDetails.description}</p>
        </div>
        <small>Criado por: {userFound?.name ? userFound?.name : "Não informado"}</small>
    </div>;

    function findByRoleAndId(role: string, id: number) {
        return api.get(`/${role}s/${id}`)
            .then(response => {
                response.data &&
                    setUserFound(response.data);

                dispatch(showModal({
                    bodyNode: moreDetailsElement,
                    hasHeader: false
                }));
            })
            .catch(error => {
                console.log(`Erro: ${error}`);
                console.log("history: Não foi possível buscar dados necessarios.");
            });
    }

    function openModal() {
        setIsLoading(true);
        findByRoleAndId(modalMoreDetails.created_by_role, modalMoreDetails.created_by_id);
        setTimeout(function () {
            setIsLoading(false);
        }, 2000);

    }

    function handleMoreDetails(step: StepT) {
        setModalMoreDetails(prevModalMoreDetails => ({
            ...prevModalMoreDetails,
            title: step.title,
            created_date: step.created_date,
            type: step.type,
            description: step.description,
            vet: step.vet,
            clinic: step.clinic,
            created_by_id: step.created_by_id,
            created_by_role: step.created_by_role
        }));
        openModal();
    }

    const handleScroll = () => {
        const el = ref.current;

        if (el !== undefined) {
            //@ts-ignore
            setPositionTop(el.scrollTop);
            //@ts-ignore
            setPositionLeft(el.scrollLeft);
        }
    };

    function convertDate(date: any, options: OptionsConvertDateT) {
        const { dateStyle, timeStyle } = options;

        //@ts-ignore
        return new Date(date).toLocaleString(navigator.language, { dateStyle, timeStyle });
    }

    useEffect(() => {
        const el = ref.current;
        if (width) {
            if (el) {
                el.scrollLeft = el.scrollWidth - el.clientWidth;
            }
        }
    }, [width]);

    useEffect(() => {
        setIsLoading(true);

        api.get(`/pets/${params.petId}/timeline`)
            .then(response => {
                setSteps(response.data);

                (urlParams.get("origin") == "iframe" && response.data.length > 3) ?
                    setSteps([response.data[response.data.length - 3], response.data[response.data.length - 2], response.data[response.data.length - 1]])
                    :
                    setSteps(response.data);
            })
            .catch(error => {
                console.log(`Erro: ${error}`);
                dispatch(show({ message: "Não foi possível carregar os dados da linha do tempo.", type: "error" }));
                navigate(`${ERoutes.PET}/${params.petId}`);
            });

        api.get(`/pets/${params.petId}`)
            .then(response => {
                setPet(response.data);
            })
            .catch(error => {
                console.log(`Erro: ${error}`);
                dispatch(show({ message: "Não foi possível encontrar dados necessários.", type: "error" }));
                navigate(`${ERoutes.PET}/${params.petId}`);
            });

        setTimeout(function () { setIsLoading(false); }, 2000);

    }, [params.petId, filter])

    //resolve a questão de assincronismo do react e a atualizacao do conteudo do modal
    useEffect(() => {
        // Função para abrir o modal com as informações atualizadas
        const openModalWithUpdatedDetails = () => {
            const moreDetailsElement = (
                <div>
                    <div className='d-flex justify-content-between mb-4'>
                        <Typography variant='body2' style={{ color: '#0b344e' }}>{modalMoreDetails.title}</Typography>
                        <Typography variant='body2' style={{ color: '#0b344e' }}>{convertDate(modalMoreDetails.created_date, { dateStyle: "long" })}</Typography>
                    </div>
                    <Typography variant='body2' style={{ color: '#0b344e' }}>Atendimento feito por: {modalMoreDetails.vet}</Typography>
                    <Typography variant='body2' style={{ color: '#0b344e' }}>Clínica: {modalMoreDetails.clinic}</Typography>


                    <div className='mt-4 d-flex flex-column'>
                        <Typography variant="body2">Descrição</Typography>
                        <p>{modalMoreDetails.description}</p>
                    </div>
                    <small>Criado por: {userFound?.name}</small>
                </div>
            );

            findByRoleAndId(modalMoreDetails.created_by_role, modalMoreDetails.created_by_id);
        };

        // Abre o modal sempre que modalMoreDetails for atualizado
        if (modalMoreDetails.title !== '') {
            openModalWithUpdatedDetails();
        }
    }, [modalMoreDetails, userFound?.name]);

    function handleFilter(filterParam?: string) {
        !filterParam ? setFilter("DEFAULT")
            :
            setFilter(filterParam);

        filterParam &&
            filterTimeline(filterParam);
    }

    function filterTimeline(filter: string) {
        const today = new Date();

        switch (filter) {
            case "TODAY": {
                setFilteredSteps(steps.filter(step => {
                    if (isSameDay(new Date(step.created_date), today)) {
                        return step
                    }
                }));
                break;
            }
            case "THIS_WEEK": {
                setFilteredSteps(steps.filter(step => {
                    if (isSameWeek(new Date(step.created_date), today)) return step
                }));
                break;
            }
            case "THIS_MONTH": {
                setFilteredSteps(steps.filter(step => {
                    if (isSameMonth(new Date(step.created_date), today)) return step
                }));
                break;
            }
            case "LAST_MONTH": {
                setFilteredSteps(steps.filter(step => {
                    if (isSameMonth(new Date(step.created_date), subMonths(today, 1))) return step
                }));
                break;
            }
            default:
                setFilteredSteps([]); // Handle the default case with an empty array or any other desired behavior
                break;
        }
    }

    return (
        urlParams.get("origin") == "iframe" ?
            <>
                {/*@ts-ignore */}
                {isLoading ?
                    <Loading />
                    :
                    <Overflow onScroll={handleScroll} ref={ref} > {/* IFrame */}
                        <Box sx={{ width: '100%' }}>
                            {steps.length > 0 ?
                                <Stepper alternativeLabel activeStep={steps.length - 1}>
                                    {steps.map((step, index) => (
                                        <Step key={index}>
                                            <StepLabel
                                                onClick={() => {
                                                    handleMoreDetails(step)
                                                }}
                                                StepIconComponent={(props) =>
                                                    <WrapperMark className='d-flex align-items-center justify-content-center flex-column'>
                                                        <p>{convertDate(step?.created_date, { dateStyle: 'medium' })}</p>
                                                        <small>às {convertDate(step?.created_date, { timeStyle: 'short' })}</small>
                                                        <ColorlibStepIcon
                                                            {...props}
                                                            extraParams={{
                                                                step
                                                            }}
                                                        />
                                                    </WrapperMark>
                                                }
                                                extraParams={{ type: 'valor1' }}
                                            >
                                                <div
                                                    style={{ border: 'none', padding: '10px 0' }}
                                                    className='d-flex flex-column justify-content-center align-items-center'
                                                >
                                                    <TitleStyled>
                                                        {step?.title}
                                                    </TitleStyled>
                                                    <SummaryStyled>{step?.description.substring(0, 30)}...</SummaryStyled>
                                                </div>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                                :
                                <p>Nada para mostrar no momento</p>
                            }
                        </Box>
                    </Overflow >}
            </>
            :
            <Section>
                <ContainerStyled>

                    <HeaderPage
                        textToStyle={"completa"}
                        style={{ color: "#FF41AD" }}
                        title="Tudo oque você precisa saber!"
                        text={"Linha do tempo completa"}
                    />

                    <Link to={`${ERoutes.PET}/${params.petId}`}>
                        <FontAwesomeIcon className="me-2" icon={faArrowLeft} />
                        Voltar
                    </Link>

                    <HeaderPet className='d-flex flex flex-column align-items-center'>
                        <img src={`/images/${pet.specie == "cachorro" ? "dog" : pet.specie == "gato" ? "cat" : "another_animals"}.svg`} />
                        <strong className='name'>{pet.name}</strong>
                        <small className="mb-4"> Até o momento {pet.name} tem <strong>{steps.length} {steps.length > 1 ? "registros" : "registro"}</strong> na linha do tempo.</small>
                    </HeaderPet>

                    <FilterOptions className='d-flex flex-wrap'>
                        <span className={filter === "TODAY" ? "active" : ""} onClick={() => filter === "TODAY" ? handleFilter() : handleFilter("TODAY")}>Hoje</span>
                        <span className={filter === "THIS_WEEK" ? "active" : ""} onClick={() => filter === "THIS_WEEK" ? handleFilter() : handleFilter("THIS_WEEK")}>Essa semana</span>
                        <span className={filter === "THIS_MONTH" ? "active" : ""} onClick={() => filter === "THIS_MONTH" ? handleFilter() : handleFilter("THIS_MONTH")}>Esse mês</span>
                        <span className={filter === "LAST_MONTH" ? "active" : ""} onClick={() => filter === "LAST_MONTH" ? handleFilter() : handleFilter("LAST_MONTH")}>Mês passado</span>
                    </FilterOptions>

                    <div className="d-flex flex-column align-items-center justify-content-center">

                        {/*@ts-ignore */}
                        <Overflow onScroll={handleScroll} ref={ref}>
                            <Box sx={{ width: '100%' }}>
                                {filter === "DEFAULT" ?
                                    <>
                                        {steps.length > 0 ?
                                            <Stepper alternativeLabel activeStep={steps.length - 1}>
                                                {steps.map((step, index) => (
                                                    <Step key={index}>
                                                        <StepLabel
                                                            onClick={() => {
                                                                handleMoreDetails(step)
                                                            }}
                                                            StepIconComponent={(props) =>
                                                                <WrapperMark className='d-flex align-items-center justify-content-center flex-column'>
                                                                    <p>{convertDate(step?.created_date, { dateStyle: 'medium' })}</p>
                                                                    <small>às {convertDate(step?.created_date, { timeStyle: 'short' })}</small>
                                                                    <ColorlibStepIcon
                                                                        {...props}
                                                                        extraParams={{
                                                                            step
                                                                        }}
                                                                    />
                                                                </WrapperMark>
                                                            }
                                                            extraParams={{ type: 'valor1' }}
                                                        >
                                                            <div
                                                                style={{ border: 'none', padding: '10px 0' }}
                                                                className='d-flex flex-column justify-content-center align-items-center'
                                                            >
                                                                <TitleStyled>
                                                                    {step?.title}
                                                                    <SummaryStyled>{step?.description.substring(0, 30)}...</SummaryStyled>
                                                                </TitleStyled>
                                                            </div>
                                                        </StepLabel>
                                                    </Step>
                                                ))}
                                            </Stepper>
                                            :
                                            <p>Nada para mostrar no momento</p>
                                        }
                                    </>
                                    :
                                    <>
                                        {
                                            filteredSteps.length > 0 ?
                                                <Stepper alternativeLabel activeStep={filteredSteps.length + 1}>
                                                    {filteredSteps.map((step, index) => (
                                                        <Step key={index}>
                                                            <StepLabel
                                                                onClick={() => {
                                                                    handleMoreDetails(step)
                                                                }}
                                                                StepIconComponent={(props) =>
                                                                    <WrapperMark className='d-flex align-items-center justify-content-center flex-column'>
                                                                        <p>{convertDate(step?.created_date, { dateStyle: 'medium' })}</p>
                                                                        <small>às {convertDate(step?.created_date, { timeStyle: 'short' })}</small>
                                                                        <ColorlibStepIcon
                                                                            {...props}
                                                                            extraParams={{
                                                                                step
                                                                            }}
                                                                        />
                                                                    </WrapperMark>
                                                                }
                                                                extraParams={{ type: 'valor1' }}
                                                            >
                                                                <div
                                                                    style={{ border: 'none', padding: '10px 0' }}
                                                                    className='d-flex flex-column justify-content-center align-items-center'
                                                                >
                                                                    <TitleStyled>
                                                                        {step?.title}
                                                                        <SummaryStyled>{step?.description.substring(0, 30)}...</SummaryStyled>
                                                                    </TitleStyled>
                                                                </div>
                                                            </StepLabel>
                                                        </Step>
                                                    ))}
                                                </Stepper>
                                                :
                                                <p>Nada encontrado no filtro</p>
                                        }
                                    </>
                                }
                            </Box>
                        </Overflow>
                    </div>

                </ContainerStyled>
            </Section>
    );
}