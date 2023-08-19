import { Nav, Navbar, NavbarBrand } from "react-bootstrap";
import NavbarCollapse from "react-bootstrap/esm/NavbarCollapse";
import { NavLink } from "react-router-dom";
import styled, { css } from "styled-components";

export const NavBarStyled = styled(Navbar)`
    padding: 24px 1rem;
    z-index: 3;
    /*Quando estiver na rota home o navbar será absolute*/
    /*Nas outras ele será relative
    Isso só será necessário se eu quiser fazer algum tipo de 
    banner e o header seja transparente por cima
    */
    ${props =>
        props.styleMustBeDifferent ?
            css`
        position:relative!important;
        width: 100%;
        background: #fff;
        `:
            `
            position:relative;
            background: #D1E8F5;
            border-bottom: 2px solid #fff;
        `
    }

    img{
        width: 200px;
    }
    
    @media(max-width: 1000px){
        position: relative!important;
        background-color: #fff;
    }
`;

export const NavStyled = styled(Nav)`
    width: 100%;

    div:first-child{
        width:100%;
        display: flex;
        flex: 1;
    }

    button{ 
        white-space: nowrap;
    }

    @media (max-width: 1000px) {
        width:unset;
    }
`;

export const NavLinkStyled = styled(NavLink)`
    margin:0 5px;

    font-style: normal;
    font-weight: 300;
    font-size: 16px;
    line-height: 22px;
    color: var(--dark-blue-500);
    text-decoration: none;
    white-space: nowrap;

    transition: all .3s;

    
    @media (max-width: 1000px) {
        padding: 2px 0;
        width:100%;
    }

    &:hover{
        color: #186ea5;
    }
`;

export const NavbarBrandStyled = styled(NavbarBrand)`
    max-width: 140px;
`;

export const NavCollapseStyled = styled(NavbarCollapse)`
    
`;