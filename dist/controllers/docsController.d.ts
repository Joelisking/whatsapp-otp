import { Request, Response } from 'express';
export declare class DocsController {
    private static swaggerDocument;
    static initialize(): Promise<void>;
    static getSwaggerUiOptions(): {
        customCss: string;
        customSiteTitle: string;
        swaggerOptions: {
            docExpansion: string;
            defaultModelsExpandDepth: number;
            defaultModelExpandDepth: number;
            displayRequestDuration: boolean;
            filter: boolean;
            showExtensions: boolean;
            showCommonExtensions: boolean;
            persistAuthorization: boolean;
        };
    };
    static getSwaggerSetup(): any;
    static getSwaggerServe(): any;
    getApiSpec(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=docsController.d.ts.map