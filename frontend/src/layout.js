import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./componentes/scrollToTop";

/* componenetes */
import { Home } from "./page/home";


const Layout = () => {
    const basename = process.env.BASENAME || "";
    return (
        <div>
          <BrowserRouter basename={basename}>
          <ScrollToTop>
          <Routes>
          <Route element={<Home />} path="/" />
          </Routes>
            </ScrollToTop>
          </BrowserRouter>
    </div>
    );
  };

export default (Layout);
