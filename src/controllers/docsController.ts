import { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { logger } from '../utils/logger';

export class DocsController {
  private static swaggerDocument: any;

  static async initialize(): Promise<void> {
    try {
      const specPath = path.join(__dirname, '../../docs/openapi.yaml');
      DocsController.swaggerDocument = YAML.load(specPath);
      logger.info('OpenAPI specification loaded successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to load OpenAPI specification');
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

  static getSwaggerSetup(): any {
    return swaggerUi.setup(DocsController.swaggerDocument, DocsController.getSwaggerUiOptions());
  }

  static getSwaggerServe(): any {
    return swaggerUi.serve;
  }

  async getApiSpec(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json(DocsController.swaggerDocument);
    } catch (error) {
      logger.error({ error }, 'Failed to return API specification');
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve API specification',
      });
    }
  }
}
