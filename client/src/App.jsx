import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import OauthVerify from "./pages/OauthVerify";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OauthVerify />} />
      </Routes>
    </div>
  );
};

export default App;
