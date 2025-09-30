"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsController = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
class DocsController {
    static swaggerDocument;
    static async initialize() {
        try {
            const specPath = path_1.default.join(__dirname, '../../docs/openapi.yaml');
            DocsController.swaggerDocument = yamljs_1.default.load(specPath);
            logger_1.logger.info('OpenAPI specification loaded successfully');
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Failed to load OpenAPI specification');
            throw error;
        }
    }
    static getSwaggerUiOptions() {
        return {
            customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .scheme-container { margin: 20px 0; padding: 20px; background: #f7f7f7; border-radius: 4px; }
      `,
            customSiteTitle: 'WhatsApp OTP Service API',
            swaggerOptions: {
                docExpansion: 'list',
                defaultModelsExpandDepth: 3,
                defaultModelExpandDepth: 3,
                displayRequestDuration: true,
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                persistAuthorization: true,
            },
        };
    }
    static getSwaggerSetup() {
        return swagger_ui_express_1.default.setup(DocsController.swaggerDocument, DocsController.getSwaggerUiOptions());
    }
    static getSwaggerServe() {
        return swagger_ui_express_1.default.serve;
    }
    async getApiSpec(req, res) {
        try {
            res.status(200).json(DocsController.swaggerDocument);
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Failed to return API specification');
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve API specification',
            });
        }
    }
}
exports.DocsController = DocsController;
//# sourceMappingURL=docsController.js.map