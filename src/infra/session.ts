/**
 * Classe para gerenciar a sessão do usuário (Singleton).
 * Armazena o token e outras informações do usuário de forma centralizada,
 * persistindo os dados no localStorage do navegador.
 */
class UserSession {
    private static instance: UserSession;

    private _token: string | null = null;
    private _user: any | null = null; // Você pode criar uma interface User mais específica

    /**
     * O construtor é privado para forçar o uso do método estático `getInstance`.
     * Ele tenta carregar os dados da sessão do localStorage ao ser inicializado.
     */
    private constructor() {
        if (typeof window !== "undefined") {
            this._token = localStorage.getItem("authToken");
            const storedUser = localStorage.getItem("userData");
            if (storedUser) {
                try {
                    this._user = JSON.parse(storedUser);
                } catch (e) {
                    console.error("Falha ao analisar dados do usuário do localStorage", e);
                    this._user = null;
                }
            }
        }
    }

    /**
     * Obtém a instância única da classe UserSession.
     */
    public static getInstance(): UserSession {
        if (!UserSession.instance) {
            UserSession.instance = new UserSession();
        }
        return UserSession.instance;
    }

    // --- Token ---
    public getToken(): string | null {
        return this._token;
    }

    public setToken(token: string | null): void {
        this._token = token;
        if (typeof window !== "undefined") {
            if (token) {
                localStorage.setItem("authToken", token);
            } else {
                localStorage.removeItem("authToken");
            }
        }
    }

    // --- User Data ---
    public getUser(): any | null {
        return this._user;
    }

    public setUser(user: any | null): void {
        this._user = user;
        if (typeof window !== "undefined") {
            if (user) {
                localStorage.setItem("userData", JSON.stringify(user));
            } else {
                localStorage.removeItem("userData");
            }
        }
    }

    /**
     * Limpa todos os dados da sessão.
     */
    public clearSession(): void {
        this.setToken(null);
        this.setUser(null);
    }
}

// Exporta uma instância única para ser usada em todo o aplicativo.
export const userSession = UserSession.getInstance();
