import googleLoginR from './googleLoginRoute.js';

export function routesInit(app) {
    app.use("/googleLogin", googleLoginR);
}
