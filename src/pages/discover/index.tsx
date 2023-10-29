import React from "react";
import { WrapperPage, Hero } from "./styles";
import { Col, Container, Row } from "react-bootstrap";
import { Section } from "../../components/layout/components/section/sections";

const DiscoverPage = () => {
    return (
        <WrapperPage>
            <Hero>
                <Section>
                    <Container>
                        <Row className="d-flex justify-content-center">
                            <Col md="8">
                                <h6>Tutor</h6>
                                <h4>Acompanhe de perto a saúde do seu amigo pet</h4>
                                <p>
                                    Tenha às informações médicas de seus animais de estimação,
                                    não precisa mais ficar em dúvida para responder sobre o
                                    histórico do pet durante as consultas.
                                    Fique por dentro de todo o progresso dos tratamentos, sem
                                    aquela ansiedade durante a espera pelo boletim médico.
                                </p>
                            </Col>
                        </Row>
                        <Row className="d-flex align-items-center justify-content-center my-4">
                            <Col md="7">
                                <img src="/images/landing/historico.png" alt="histórico de procedimentos e consultas" />
                            </Col>
                        </Row>
                        <Row className="d-flex justify-content-center">
                            <Col md="8">
                                <h6 className="right">Empresa</h6>
                                <h4 className="right">Tenha uma relação transparente com seus clientes</h4>
                                <p className="right">
                                    Forneça informações mais rapidamente para quem se preocupa com o bem estar do pet,
                                    evitando maiores anseios e melhorando sua relação com cliente.
                                </p>
                            </Col>
                        </Row>
                    </Container>
                </Section>
            </Hero>
        </WrapperPage>
    )
}
export default DiscoverPage;