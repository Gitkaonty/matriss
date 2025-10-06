import React from "react";
import { BiHomeAlt2, BiSelectMultiple } from "react-icons/bi";
import { FaRegChartBar } from "react-icons/fa6";
import { BiSliderAlt } from "react-icons/bi";
import { RiShareForwardBoxLine } from "react-icons/ri";
import { GoFile } from "react-icons/go";

const styleMenuIcon = {
  width: "25px",
  height: "25px",
  color: "white",
}

const humburgerMenu = [
  {
    text: 'Home',
    name: "home",
    icons: <BiHomeAlt2 style={styleMenuIcon} />,
    path: "/tab/home",
    subMenu: null,
    urlDynamic: false
  },
  {
    text: 'Dashboard',
    name: "dashboard",
    icons: <FaRegChartBar style={styleMenuIcon} />,
    path: "/tab/dashboard",
    subMenu: null,
    urlDynamic: true
  },
  {
    text: 'Administration',
    name: "administration",
    icons: <GoFile style={styleMenuIcon} />,
    path: "/tab/administration",
    subMenu: 1,
    urlDynamic: false
  },
  {
    text: 'Révisions',
    name: "revision",
    icons: <BiSelectMultiple style={styleMenuIcon} />,
    path: "/tab/revision",
    subMenu: 1,
    urlDynamic: false
  },
  {
    text: 'Déclarations',
    name: "declaration",
    icons: <RiShareForwardBoxLine style={styleMenuIcon} />,
    path: "/tab/declaration",
    subMenu: 1,
    urlDynamic: false
  },
  {
    text: 'Paramétrages',
    name: "parametrages",
    icons: <BiSliderAlt style={styleMenuIcon} />,
    path: "/tab/parametrages",
    subMenu: 1,
    urlDynamic: false
  }
];

export default humburgerMenu;