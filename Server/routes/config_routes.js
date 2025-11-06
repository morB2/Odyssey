import LoginR from './loginRoute.js';

export function routesInit(app) {
    app.use("/login", LoginR);
}
