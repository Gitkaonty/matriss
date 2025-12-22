import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogout from './useLogout';

export default function useAutoLogout(timeout = 60 * 60 * 1000) {
    const navigate = useNavigate();
    const logout = useLogout();

    useEffect(() => {
        let timer;

        const resetTimer = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(async () => {
                try {
                    await logout();
                } catch (err) {
                    console.error(err);
                }
                navigate('/', { replace: true });
            }, timeout);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

        events.forEach(e => window.addEventListener(e, resetTimer));

        resetTimer();

        return () => {
            if (timer) clearTimeout(timer);
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, [navigate, timeout]);
}
