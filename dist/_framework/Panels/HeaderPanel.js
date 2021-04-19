import React, {useState, useEffect} from "react";
import styled from "styled-components";
import {useToolControlHelper, useStackId} from "../ToolRoot.js";
import UserProfile from "../temp/UserProfile.js";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import axios from "axios";
const Wrapper = styled.div`
  grid-area: headerPanel;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  padding: 4px;
  background-color: hsl(0, 0%, 99%);
`;
const ControlsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  width: 100%;
`;
const ExitOverlayButton = styled.button`
  width: 45px;
  height: 45px;
  font-size: 16px;
  color: #ffffff;
  background-color: #1a5a99;
  border: 1px solid #ffffff;
  border-radius: 50%;
  /* border-style: none; */
  cursor: pointer;
`;
export default function HeaderPanel({title, children}) {
  const {close} = useToolControlHelper();
  const stackId = useStackId();
  const [profile, setProfile] = useState({});
  const jwt = Cookies.get();
  let isSignedIn = false;
  if (Object.keys(jwt).includes("JWT_JS")) {
    isSignedIn = true;
  }
  useEffect(() => {
    const phpUrl = "/api/loadProfile.php";
    const data = {};
    const payload = {
      params: data
    };
    axios.get(phpUrl, payload).then((resp) => {
      if (resp.data.success === "1") {
        setProfile(resp.data.profile);
      }
    }).catch((error) => {
    });
  }, []);
  return /* @__PURE__ */ React.createElement(Wrapper, null, /* @__PURE__ */ React.createElement(ControlsContainer, null, /* @__PURE__ */ React.createElement("p", null, title), children), !(stackId > 0) ? /* @__PURE__ */ React.createElement(UserProfile, {
    profile,
    cookies: jwt,
    isSignedIn,
    showProfileOnly: true
  }) : /* @__PURE__ */ React.createElement(ExitOverlayButton, {
    onClick: close
  }, /* @__PURE__ */ React.createElement(FontAwesomeIcon, {
    icon: faTimes
  })));
}
