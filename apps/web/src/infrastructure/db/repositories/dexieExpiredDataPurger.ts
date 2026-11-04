import type Dexie from 'dexie';
import type { ExpiredDataPurger, PurgeReport } from '../../../domain/ports/expiredDataPurger';
import type { RetentionCutoffs } from '../../../domain/privacy/retention';
import type { DomainError } from '../../../domain/shared/domainError';
import type { Result } from '../../../domain/shared/result';
import { storageResult } from '../storageResult';

/**
 * Indexed dates these tables must use, so that comparing strings compares instants:
 * `journal.expiresAt` and `conversations.startedAt` are ISO strings in UTC (`toISOString()`),
 * `aiUsage.date` is a day key (YYYY-MM-DD).
 */
const PURGED_TABLES = ['journal', 'conversations', 'messages', 'aiUsage'];

export class DexieExpiredDataPurger implements ExpiredDataPurger {
  constructor(private readonly db: Dexie) {}

  purge(cutoffs: RetentionCutoffs): Promise<Result<PurgeReport, DomainError>> {
    return storageResult('could not purge expired data', () =>
      this.db.transaction('rw', PURGED_TABLES, async () => {
        const journal = await this.db
          .table('journal')
          .where('expiresAt')
          .belowOrEqual(cutoffs.journalExpiredAt.toISOString())
          .delete();
        const { conversations, messages } = await this.purgeConversations(
          cutoffs.conversationsStartedBefore,
        );
        const aiUsage = await this.db
          .table('aiUsage')
          .where('date')
          .below(cutoffs.aiUsageBefore)
          .delete();
        return { journal, conversations, messages, aiUsage };
      }),
    );
  }

  private async purgeConversations(
    startedBefore: Date,
  ): Promise<{ conversations: number; messages: number }> {
    const old = this.db
      .table('conversations')
      .where('startedAt')
      .below(startedBefore.toISOString());
    const ids = await old.primaryKeys();
    const messages = await this.db.table('messages').where('conversationId').anyOf(ids).delete();
    const conversations = await old.delete();
    return { conversations, messages };
  }
}
