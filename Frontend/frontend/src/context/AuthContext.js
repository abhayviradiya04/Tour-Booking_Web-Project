import { createContext, useEffect, useReducer } from 'react';

const initial_state = {
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    loading: false,
    error: null
};

export const AuthContext = createContext(initial_state);

const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return { user: null, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            return { user: action.payload, loading: false, error: null };
        case 'LOGIN_FAILURE':
            return { user: null, loading: false, error: action.payload };
        case 'REGISTER_SUCCESS':
            return { user: null, loading: false, error: null };
        case 'LOGOUT':
            localStorage.removeItem('user'); // ✅ Clear localStorage on logout
            localStorage.removeItem('expirationTime');
            return { user: null, loading: false, error: null };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, initial_state);

    useEffect(() => {
        const expirationTime = localStorage.getItem('expirationTime');

        if (expirationTime && new Date().getTime() > expirationTime) {
            localStorage.removeItem('user');
            localStorage.removeItem('expirationTime');
            dispatch({ type: 'LOGOUT' });
        } else if (state.user) {
            localStorage.setItem('user', JSON.stringify(state.user)); // ✅ Only store user if exists
        }
    }, [state.user]);

    return (
        <AuthContext.Provider value={{ user: state.user, loading: state.loading, error: state.error, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
