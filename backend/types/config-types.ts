export interface Config {
    jwt: {
      secret: string;
      expiresIn: string | number;
    };
    google: {
      clientId: string;
      clientSecret: string;
      callbackURL: string;
    };
    database: {
        host: string;
        port: number;
        user: string;
        password: string;
        databaseName: string;
        dialect: string;
        logging: boolean;
    },
    bcryptSaltRounds: number;
    nodeEnv: string;
    port: number;
    appUrl: string;
}