export * from './accounts.service';
import { AccountsService } from './accounts.service';
export * from './azureAi.service';
import { AzureAiService } from './azureAi.service';
export const APIS = [AccountsService, AzureAiService];
