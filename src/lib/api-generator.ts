/**
 * Gerador automático de funções API baseado em GenericApiService
 * 
 * Uso:
 * 1. Defina a configuração do módulo (endpoint, tipo TypeScript)
 * 2. Execute generateApiModule() para gerar as funções
 * 3. Cole o código gerado em api.client.ts
 * 
 * Exemplo:
 * const orderModule = generateApiModule({
 *   name: 'Order',
 *   endpoint: 'order',
 *   idType: 'number'
 * });
 * 
 * console.log(orderModule); // código TypeScript pronto para usar
 */

interface ApiModuleConfig {
  /** Nome do tipo (ex: Order, Invoice, Approval) */
  name: string;
  /** Endpoint da API (ex: 'order', 'invoice', 'approval') */
  endpoint: string;
  /** Tipo do ID (number ou string) */
  idType: 'number' | 'string';
  /** Métodos customizados adicionais (opcional) */
  customMethods?: CustomMethod[];
}

interface CustomMethod {
  /** Nome da função (ex: 'approve', 'cancel') */
  name: string;
  /** Path relativo (ex: '{id}/approve') */
  path: string;
  /** Método HTTP */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Tipo de retorno (opcional, padrão: void) */
  returnType?: string;
  /** Parâmetros adicionais (opcional) */
  params?: string[];
}

/**
 * Gera o código TypeScript completo para um módulo de API
 */
export function generateApiModule(config: ApiModuleConfig): string {
  const { name, endpoint, idType, customMethods = [] } = config;
  const nameLower = name.toLowerCase();
  const namePlural = name + 's'; // simplificado, pode melhorar
  const namePluralLower = namePlural.toLowerCase();

  const lines: string[] = [];

  // 1. Importação do tipo (assumindo que existe em types.ts)
  lines.push(`// --- ${namePlural} (${name}) ---`);

  // 2. Instância da API
  lines.push(`const ${nameLower}Api = new Api<${name}, ${idType}>('/${endpoint}');`);
  lines.push('');

  // 3. Função list (getAll)
  lines.push(
    `export const get${namePlural} = (term: string = "", page: number = 0, size: number = 20): Promise<${name}[]> =>`,
    `  ${nameLower}Api.list(page, size, term);`
  );
  lines.push('');

  // 4. Função getById
  lines.push(
    `export const get${name}ById = (id: ${idType}): Promise<${name}> =>`,
    `  ${nameLower}Api.getById(id);`
  );
  lines.push('');

  // 5. Função create
  lines.push(
    `export const create${name} = (data: Partial<${name}>): Promise<${name}> =>`,
    `  ${nameLower}Api.saveOrUpdate(data);`
  );
  lines.push('');

  // 6. Função update
  lines.push(
    `export const update${name} = (id: ${idType}, data: Partial<${name}>): Promise<${name}> =>`,
    `  ${nameLower}Api.saveOrUpdate({ ...data, id });`
  );
  lines.push('');

  // 7. Função delete
  lines.push(
    `export const delete${name} = (id: ${idType}): Promise<void> =>`,
    `  ${nameLower}Api.delete(id);`
  );
  lines.push('');

  // 8. Métodos customizados
  customMethods.forEach((method) => {
    const funcName = `${nameLower}${method.name.charAt(0).toUpperCase() + method.name.slice(1)}`;
    const pathTemplate = method.path.replace('{id}', '${id}');
    const returnType = method.returnType || 'void';
    const params = method.params || [];
    const allParams = ['id: ' + idType, ...params].join(', ');

    lines.push(
      `export const ${funcName} = (${allParams}): Promise<${returnType}> =>`,
      `  fetchData<${returnType}>(\`/${endpoint}/${pathTemplate}\`, { method: "${method.method}" });`
    );
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Gera código para todos os módulos faltantes identificados no relatório
 */
export function generateAllMissingModules(): Record<string, string> {
  const modules: ApiModuleConfig[] = [
    // P1 - Alta prioridade
    { name: 'Order', endpoint: 'order', idType: 'number' },
    { name: 'Opportunity', endpoint: 'opportunity', idType: 'number' },
    { name: 'Pipeline', endpoint: 'pipeline', idType: 'number' },
    { name: 'Stage', endpoint: 'stage', idType: 'number' },
    { name: 'Task', endpoint: 'task', idType: 'number' },

    // P2 - Média prioridade
    { name: 'Team', endpoint: 'team', idType: 'number' },
    { name: 'Seller', endpoint: 'seller', idType: 'number' },
    { name: 'Campaign', endpoint: 'campaign', idType: 'number' },
    { name: 'Receivable', endpoint: 'receivable', idType: 'number' },
    {
      name: 'Approval',
      endpoint: 'approval',
      idType: 'number',
      customMethods: [
        { name: 'approve', path: '{id}/approve', method: 'POST' },
        { name: 'reject', path: '{id}/reject', method: 'POST' },
      ],
    },
    { name: 'Invoice', endpoint: 'invoice', idType: 'number' },

    // P3 - Baixa prioridade (Cadastros auxiliares)
    { name: 'AddressType', endpoint: 'address-type', idType: 'number' },
    { name: 'ContactType', endpoint: 'contact-type', idType: 'number' },
    { name: 'CustomerGroup', endpoint: 'customer-group', idType: 'number' },
    { name: 'CustomerTag', endpoint: 'customer-tag', idType: 'number' },
    { name: 'LossReason', endpoint: 'loss-reason', idType: 'number' },
    { name: 'PaymentCondition', endpoint: 'payment-condition', idType: 'number' },
    { name: 'PaymentType', endpoint: 'payment-type', idType: 'number' },
    { name: 'PriceTag', endpoint: 'price-tag', idType: 'number' },
    { name: 'ProductGroup', endpoint: 'product-group', idType: 'number' },
    { name: 'ProductTag', endpoint: 'product-tag', idType: 'number' },
    { name: 'ReceivableHolder', endpoint: 'receivable-holder', idType: 'number' },
    { name: 'ReceivableStatus', endpoint: 'receivable-status', idType: 'number' },
    { name: 'ReceivableType', endpoint: 'receivable-type', idType: 'number' },
    { name: 'Unit', endpoint: 'unit', idType: 'number' },
  ];

  const result: Record<string, string> = {};

  modules.forEach((config) => {
    result[config.name] = generateApiModule(config);
  });

  return result;
}

/**
 * Gera arquivo completo api.client.generated.ts com todos os módulos
 */
export function generateCompleteApiClient(): string {
  const header = `// filepath: /home/brunodxd/repo/venda+/venda-next-front/src/lib/api.client.generated.ts
/**
 * ESTE ARQUIVO FOI GERADO AUTOMATICAMENTE
 * Não edite manualmente - use api-generator.ts para regenerar
 * Data: ${new Date().toISOString()}
 */

import Api, { fetchData } from "./api";
import {
  Order,
  Opportunity,
  Pipeline,
  Stage,
  Task,
  Team,
  Seller,
  Campaign,
  Receivable,
  Approval,
  Invoice,
  AddressType,
  ContactType,
  CustomerGroup,
  CustomerTag,
  LossReason,
  PaymentCondition,
  PaymentType,
  PriceTag,
  ProductGroup,
  ProductTag,
  ReceivableHolder,
  ReceivableStatus,
  ReceivableType,
  Unit,
} from "./types";

`;

  const allModules = generateAllMissingModules();
  const body = Object.values(allModules).join('\n\n');

  return header + body;
}

// --- Execução direta (ES Module) ---
console.log(generateCompleteApiClient());