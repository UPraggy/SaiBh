import { useEffect, useState } from 'react';
import { BrowserRouter, Routes as Router, Route } from 'react-router-dom';
import HomePage from './components/HomePage';

function Routes() {
    const [ativaResp, setAtivaResp] = useState(null)

    useEffect(() => {
        if (ativaResp == null) {
            if (window.matchMedia("(max-width: 767px)").matches) setAtivaResp(true)
            else setAtivaResp(false)
        }
        const onResize = () => setAtivaResp(window.matchMedia("(max-width: 767px)").matches)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [ativaResp])

    return (
        <BrowserRouter>
            <Router>
                <Route path="/" element={<HomePage ativaResp={ativaResp} />} />
            </Router>
        </BrowserRouter>
    );
}

export default Routes;
